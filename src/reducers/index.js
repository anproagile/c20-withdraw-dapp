import {
  actions
} from '../actions'
import {
  initialState,
  userType,
  txState,
} from './initialState'

const reducer = (state = initialState, action) => {
  switch (action.type) {
    // TODO:: use sub-reducers
    case actions.SAVE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          loaded: true,
          address: action.userAddress
        }
      }
    case actions.LOAD_USERS_WITHDRAWAL:
      return {
        ...state,
        user: {
          ...state.user,
          userType: (action.hasWithdrawal ? userType.REQUEST_WITHDRAW :  userType.WITHDRAW_ETH),
          withdrawalData: {
            tokens: action.withdrawal[0],
            time: action.withdrawal[1]
          }
        }
      }
    case actions.SAVE_USER_BALANCE:
      let displayBalance = action.precisionBalance.div('1000000000000000000').toNumber()
      return {
        ...state,
        price: {
          ...state.price,
          tokens: {
            ...state.price.tokens,
            user: {
              ...state.price.tokens.user,
              loaded: true,
              displayBalance,
              balanceWeiBN: action.precisionBalance,
            }
          }
        }
      }
    case actions.SAVE_ETHER_PRICE:
      const {
        wasError,
        price,
        price_btc,
        last_updated,
      } = action
      if (wasError) return {
        errorMessage: 'Error: the coinmarketcap.com service is unavailable.'
      }

      return {
        ...state,
        price: {
          ...state.price,
          ether: {
            ...state.price.ether,
            price,
            price_btc,
            last_updated,
            errorMessage: "",
          }
        }
      }
    case actions.UPDATE_PRICE:
      if (action.blockNum < state.price.blockNum)
        return state

      const tokensPerEther = action.numerator.div(action.denominator).toNumber()

      return {
        ...state,
        price: {
          ...state.price,
          tokens: {
            ...state.price.tokens,
            fund: {
              ...state.price.tokens.fund,
              numerator: action.numerator,
              denominator: action.denominator,
              tokensPerEther,
              txHash: action.txHash,
              blockNum: action.blockNum,
            }
          }
        },
        updateTicker: {
          ...state.updateTicker,

        }
      }
    case actions.UPDATE_MINUTE:
      const inSync = (state.updateTicker.minute%60) == action.minute
      const increment = inSync ? 0 : 1
      let minute
      if (action.wasUpdate){
        if (action.minute > 57) {
          minute = action.minute - 60
        } else {
          minute = action.minute
        }
      } else {
        minute = Math.min(60, state.updateTicker.minute + increment)
      }

      if (((minute+60)%60) !== action.minute && minute != 60) // this means it is comletely out of sync (ie when it starts up)
        minute = action.minute

      return {
        ...state,
        updateTicker: {
          ...state.updateTicker,
          minute,
        }
      }
    case actions.INIT_REQUEST:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          request: {
            ...state.transactions.request,
            state: txState.INIT,
          }
        }
      }
    case actions.SUBMIT_REQUEST:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          request: {
            ...state.transactions.request,
            state: txState.SUBMIT,
            txHash: action.tx
          }
        }
      }
    case actions.COMPLETE_REQUEST:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          request: {
            ...state.transactions.request,
            state: txState.COMPLETE,
          }
        }
      }
    case actions.INIT_WITHDRAWAL:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          withdrawal: {
            ...state.transactions.withdrawal,
            state: txState.INIT,
          }
        }
      }
    case actions.SUBMIT_WITHDRAWAL:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          withdrawal: {
            ...state.transactions.withdrawal,
            state: txState.SUBMIT,
            txHash: action.tx
          }
        }
      }
    case actions.COMPLETE_WITHDRAWAL:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          withdrawal: {
            ...state.transactions.withdrawal,
            state: txState.COMPLETE,
          }
        }
      }
    case actions.INIT_SEND:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          transfer: {
            ...state.transactions.transfer,
            state: txState.INIT,
          }
        }
      }
    case actions.SUBMIT_SEND:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          transfer: {
            ...state.transactions.transfer,
            state: txState.SUBMIT,
            txHash: action.tx
          }
        }
      }
    case actions.COMPLETE_SEND:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          transfer: {
            ...state.transactions.transfer,
            state: txState.COMPLETE,
          }
        }
      }
    default:
      return state
  }
}

export default reducer
