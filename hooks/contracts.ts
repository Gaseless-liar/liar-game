import gasless_liar_abi from "../abi/GasLessLiar.json";
import erc20_abi from "../abi/erc20_abi.json";
import { Abi, Contract } from "starknet";

export const gaslessLiarContract: string =
    "0x03318a1deb68f534113f421ec5a7a05ca9e0f5c3803bae195b46d8af630834d1"
//   "0x01d3c0f481a1adacdf251d9af2710ea119e0facde4dfd8b6269bb8ef7c6889e5";

export const ethereumContract: string =
  "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7";

export function useGaslessLiarContract() {
    const gaslessGame = new Contract(
        gasless_liar_abi as Abi,
        gaslessLiarContract
      );
    return gaslessGame
}

export function useEthereumContract() {
    const erc20 = new Contract(
        erc20_abi as Abi,
        ethereumContract
      );
    return erc20
}
  