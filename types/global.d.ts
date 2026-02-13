declare module 'react/jsx-runtime' {
  export { Fragment, jsx, jsxs } from 'react';
}

declare module 'react/jsx-dev-runtime' {
  export { Fragment, jsx, jsxs } from 'react';
}

declare module 'react' {
  export type ReactNode = 
    | string 
    | number 
    | boolean 
    | null 
    | undefined
    | ReactElement
    | ReactNodeArray
    | ReactPortal
    | {};

  export interface ReactElement {
    type: any;
    props: any;
    key: string | null;
    ref: any;
  }

  export interface ReactNodeArray extends Array<ReactNode> {}
  
  export interface ReactPortal {
    key: string | null;
    children: ReactNode;
  }
  
  export interface ComponentType<P = {}> {
    (props: P): ReactNode;
    displayName?: string;
  }
  
  export interface FunctionComponent<P = {}> {
    (props: P): ReactNode;
    displayName?: string;
  }

  export interface ExoticComponent<P = {}> {
    $$typeof: symbol;
    render: (props: P) => ReactNode;
  }

  export const Fragment: ExoticComponent<{ children?: ReactNode }>;
  export const StrictMode: ExoticComponent<{ children?: ReactNode }>;
  export const Suspense: ExoticComponent<{ children: ReactNode; fallback?: ReactNode }>;
  
  export const createElement: any;
  export const cloneElement: any;
  export const isValidElement: any;
  export const createRef: any;
  export const forwardRef: any;
  export const memo: any;
  export const createContext: <T>(defaultValue: T) => Context<T>;
  export const useCallback: <T extends (...args: any[]) => any>(callback: T, deps: any[]) => T;
  export const useContext: <T>(context: React.Context<T>) => T;
  export const useEffect: (effect: () => void | (() => void), deps?: any[]) => void;
  export const useLayoutEffect: (effect: () => void | (() => void), deps?: any[]) => void;
  export const useInsertionEffect: (effect: () => void | (() => void), deps?: any[]) => void;
  export const useMemo: <T>(factory: () => T, deps: any[]) => T;
  export const useReducer: <S, A>(reducer: (state: S, action: A) => S, initialState: S, init?: (initialState: S) => S) => [S, (action: A) => void];
  export const useRef: <T>(initial: T) => { current: T };
  export const useState: <T>(initial: T | (() => T)) => [T, (value: T) => void];
  export const useDebugValue: <T>(value: T, formatter?: (value: T) => any) => void;
  export const useTransition: () => [boolean, (callback: () => void) => void];
  export const useDeferredValue: <T>(value: T) => T;
  export const useId: () => string;
  export const useSyncExternalStore: <T>(subscribe: (onStoreChange: () => void) => () => void, getSnapshot: () => T, getServerSnapshot?: () => T) => T;
  export const startTransition: (callback: () => void) => void;

  // Context types
  export interface Context<T> {
    Provider: React.ComponentType<{ value: T; children: ReactNode }>;
    displayName?: string;
  }

  // JSX runtime exports
  export const jsx: (type: any, props: any, key?: string) => any;
  export const jsxs: (type: any, props: any, key?: string) => any;

  // JSX namespace for proper JSX handling
  namespace JSX {
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicAttributes {
      key?: string | number | null;
    }
    interface IntrinsicClassAttributes<T> {
      key?: string | number | null;
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react-native' {
  import * as React from 'react';
  import type { ReactNode } from 'react';
  
  export interface ViewProps {
    children?: ReactNode;
    style?: any;
    onLayout?: (event: any) => void;
  }
  
  export interface TextProps {
    children?: ReactNode;
    style?: any;
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  }
  
  export interface PressableProps {
    children?: ReactNode;
    style?: any;
    onPress?: () => void;
    onLongPress?: () => void;
    disabled?: boolean;
  }
  
  export interface ScrollViewProps {
    children?: ReactNode;
    style?: any;
    contentContainerStyle?: any;
    refreshControl?: ReactNode;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
  }
  
  export interface StyleSheetStatic {
    create<T>(styles: T): T;
    flatten<T>(style: T): T;
  }
  
  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const Pressable: React.ComponentType<PressableProps>;
  export const ScrollView: React.ComponentType<ScrollViewProps>;
  export const StyleSheet: StyleSheetStatic;
  export const Platform: {
    OS: 'ios' | 'android' | 'web';
    select<T>(specifics: { ios?: T; android?: T; web?: T; default: T }): T;
  };
  export const Dimensions: {
    get(dim: 'window' | 'screen'): { width: number; height: number };
  };
}

declare module '@expo/vector-icons' {
  import * as React from 'react';
  import type { ReactNode } from 'react';
  
  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  export const Ionicons: React.ComponentType<IconProps>;
}

declare module 'react-native-safe-area-context' {
  import * as React from 'react';
  
  export const useSafeAreaInsets: () => {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

declare module 'expo-router' {
  import * as React from 'react';
  
  export const router: {
    push: (path: string) => void;
    back: () => void;
    replace: (path: string) => void;
  };
  
  export const useLocalSearchParams: <T = Record<string, string>>() => T;
}

declare module 'expo-haptics' {
  export const ImpactFeedbackStyle: {
    Light: 'light';
    Medium: 'medium';
    Heavy: 'heavy';
  };
  export const impactAsync: (style: 'light' | 'medium' | 'heavy') => Promise<void>;
}

declare module 'react-native-reanimated' {
  import * as React from 'react';
  import type { ReactNode } from 'react';
  
  export interface AnimatedProps {
    entering?: any;
    layout?: any;
  }
  
  export interface ViewProps {
    children?: ReactNode;
    style?: any;
    onLayout?: (event: any) => void;
  }
  
  export const Animated: {
    View: React.ComponentType<ViewProps & AnimatedProps>;
    Text: React.ComponentType<any>;
    ScrollView: React.ComponentType<any>;
  };
  
  export const FadeIn: any;
  export const FadeInDown: any;
  
  // Also export the View component directly
  export const View: React.ComponentType<ViewProps & AnimatedProps>;
}

declare module 'react-native-chart-kit' {
  import { ViewProps } from 'react-native';
  
  export interface BarChartProps {
    data: any;
    width?: number;
    height?: number;
    color?: string;
  }

  export interface LineChartProps {
    data: any;
    width?: number;
    height?: number;
    color?: string;
  }

  export const BarChart: React.ComponentType<BarChartProps>;
  export const LineChart: React.ComponentType<LineChartProps>;
}

declare module 'expo-notifications' {
  export interface NotificationRequest {
    identifier: string;
    content: NotificationContentInput;
    trigger: NotificationTriggerInput | null;
  }

  export interface NotificationContentInput {
    title: string;
    body: string;
    data?: Record<string, any>;
    sound?: string | 'default' | null;
  }

  export interface NotificationTriggerInput {
    type: string;
    [key: string]: any;
  }

  export function setNotificationHandler(handler: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }): void;

  export function requestPermissionsAsync(): Promise<{ status: string }>;
  export function scheduleNotificationAsync(request: NotificationRequest): Promise<string>;
  export function cancelScheduledNotificationAsync(identifier: string): Promise<void>;
  export function getAllScheduledNotificationsAsync(): Promise<NotificationRequest[]>;
  export function dismissAllNotificationsAsync(): Promise<void>;
}

declare module 'bcryptjs' {
  export function hash(password: string, saltRounds: number): Promise<string>;
  export function compare(password: string, hash: string): Promise<boolean>;
}

declare module 'date-fns' {
  export function subDays(date: Date, amount: number): Date;
  export function startOfDay(date: Date): Date;
  export function endOfDay(date: Date): Date;
  export function eachDayOfInterval(interval: { start: Date; end: Date }): Date[];
  export function format(date: Date, formatStr: string): string;
}

declare module 'postgres' {
  export default function postgres(connection: string, options?: any): any;
}

declare module 'ws' {
  export class WebSocket {
    constructor(url: string);
    close(): void;
    send(data: string): void;
    on(event: string, callback: Function): void;
  }
}

declare module 'expo' {
  export function reloadAppAsync(): Promise<void>;
}

declare module 'zod-validation-error' {
  export function fromZodError(error: any): Error;
}

declare global {
  namespace ReactNative {
    interface ColorValue {
      toString(): string;
    }
  }
}
