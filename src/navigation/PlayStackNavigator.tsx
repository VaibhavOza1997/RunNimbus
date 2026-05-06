import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/Home/HomeScreen';
import SagaDetailScreen from '@/screens/Saga/SagaDetailScreen';
import StepScreen from '@/screens/Saga/StepScreen';
import ChallengeScreen from '@/screens/Challenge/ChallengeScreen';
import { Colors } from '@/theme';

export type PlayStackParamList = {
  SagaList: undefined;
  SagaDetail: { sagaId: string };
  Step: { sagaId: string; stepId: number };
  Challenge: { sagaId: string; stepId: number; challengeId: number };
};

const Stack = createNativeStackNavigator<PlayStackParamList>();

export default function PlayStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.primary,
        headerTitleStyle: { color: Colors.textPrimary },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="SagaList" component={HomeScreen} options={{ title: 'Run Nimbus' }} />
      <Stack.Screen name="SagaDetail" component={SagaDetailScreen} options={{ title: 'Saga' }} />
      <Stack.Screen name="Step" component={StepScreen} options={{ title: 'Step' }} />
      <Stack.Screen name="Challenge" component={ChallengeScreen} options={{ title: 'Challenge' }} />
    </Stack.Navigator>
  );
}
