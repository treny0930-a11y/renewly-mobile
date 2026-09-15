import { Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/Home.js'
import CalendarScreen from '../screens/Calendar.js'
import DecisionsScreen from '../screens/Decisions.js'
import NotificationsScreen from '../screens/Notifications.js'
import SettingsScreen from '../screens/Settings.js'
import DetailScreen from '../screens/Detail.js'
import AddScreen from '../screens/Add.js'
import CancelSavingsScreen from '../screens/CancelSavings.js'
import DecisionChangeScreen from '../screens/DecisionChange.js'
import BillingEditScreen from '../screens/BillingEdit.js'
import { colors } from '../theme.js'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const TABS = [
  { name: 'Home', label: '홈', icon: '⌂', component: HomeScreen },
  { name: 'Calendar', label: '결제 일정', icon: '◫', component: CalendarScreen },
  { name: 'Decisions', label: '결정함', icon: '◎', component: DecisionsScreen },
  { name: 'Notifications', label: '알림', icon: '◔', component: NotificationsScreen },
  { name: 'Settings', label: '설정', icon: '⚙', component: SettingsScreen },
]

function MainTabs() {
  return (
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
  )
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Add" component={AddScreen} />
        <Stack.Screen name="CancelSavings" component={CancelSavingsScreen} />
        <Stack.Group screenOptions={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}>
          <Stack.Screen name="DecisionChange" component={DecisionChangeScreen} />
          <Stack.Screen name="BillingEdit" component={BillingEditScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  )
}
