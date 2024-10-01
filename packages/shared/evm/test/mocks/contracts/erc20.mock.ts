import { ethers } from "ethers";
import { ERC20 } from "../../../src/contracts/erc20";
import { createMock, MethodMock, MockData } from "@shared/test";

export const ERC20Mock = createMock<ERC20>({
    balanceOf: new MethodMock("mockResolvedValue", ethers.BigNumber.from("100000000000000000000")),
    allowance: new MethodMock("mockResolvedValue", ethers.BigNumber.from("0")),
    approve: new MethodMock("mockResolvedValue", true),
} as MockData<ERC20>);
