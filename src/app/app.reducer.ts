export interface State {
  isLoading: boolean;
}

const initialState: State = {
  isLoading: false
};

interface Action {
  type: string;
}

export function appReducer(state = initialState, action: Action): State {
  switch (action.type) {
    case 'START_LOADING':
      return {
        isLoading: true
      };
    case 'STOP_LOADING':
      return {
        isLoading: true
      };
    default:
      return state;
  }
}
