# Renewly

SaaS 구독 갱신 의사결정을 돕는 iOS 앱. 사용 빈도·업무 중요도·대체 가능성·비용 부담 4가지 기준으로 각 구독을 평가해 유지·재검토·해지 후보로 정리한다.

React Native(Expo) 앱이며, 웹 버전(`Saas-nex-app`)의 도메인 로직과 디자인 토큰을 그대로 포팅했다.

## 로컬 개발

```bash
npm ci
npx expo start
```

시뮬레이터에서 열려면 `i`를 누르거나 Expo Go 앱으로 QR코드를 스캔한다.

## 테스트

```bash
npm test        # 도메인 로직 + 스토리지 레이어 + 유틸 단위 테스트 (node --test)
npx expo lint    # ESLint
npx expo export  # 번들이 깨지지 않는지 확인 (iOS/Android 둘 다)
```

## 아키텍처

- `src/domain/subscription.js` — 순수 함수. 평가 점수 계산, 결제일 히트맵, 절감액 계산 등. 웹 버전에서 그대로 포팅됨(로직 변경 없음).
- `src/storage/subscriptionStorage.js` — AsyncStorage 저장/로드. **이 파일은 `@react-native-async-storage/async-storage`를 절대 직접 import하지 않는다** — storage 어댑터를 매개변수로 명시적으로 받아, 순수 `node --test`로 테스트 가능하게 유지한다. 실제 AsyncStorage 연결은 `src/context/SubscriptionsContext.js`에서만 이루어진다.
- `src/context/SubscriptionsContext.js` — 앱 전역 상태(구독 목록, 이벤트 로그, 온보딩 여부, 토스트)와 액션을 제공하는 React Context. 유일하게 AsyncStorage를 직접 import하는 파일.
- `src/navigation/RootNavigator.js` — 루트 Stack(탭 화면 + 푸시 화면) + `transparentModal` 그룹(결정 변경/결제일 수정 바텀시트).
- `src/screens/`, `src/components/` — 화면과 공유 UI 컴포넌트.

데이터는 이 기기에만 저장된다. 계정, 로그인, 서버 동기화, 외부 알림 발송은 없다.
