import { Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/Home.js'
import CalendarScreen from '../screens/Calendar.js'
import DecisionsScreen from '../screens/Decisions.js'
import NotificationsScreen from '../screens/Notifications.js'
import SettingsScreen from '../screens/Settings.js'
import { colors } from '../theme.js'

const Tab = createBottomTabNavigator()

const TABS = [
  { name: 'Home', label: '홈', icon: '⌂', component: HomeScreen },
  { name: 'Calendar', label: '결제 일정', icon: '◫', component: CalendarScreen },
  { name: 'Decisions', label: '결정함', icon: '◎', component: DecisionsScreen },
  { name: 'Notifications', label: '알림', icon: '🔔', component: NotificationsScreen },
  { name: 'Settings', label: '설정', icon: '⚙', component: SettingsScreen },
]

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const tab = TABS.find((candidate) => candidate.name === route.name)
          return {
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.inkSecondary,
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>{tab.icon}</Text>,
            tabBarLabel: tab.label,
          }
        }}
      >
        {TABS.map(({ name, component }) => (
          <Tab.Screen key={name} name={name} component={component} />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  )
}
