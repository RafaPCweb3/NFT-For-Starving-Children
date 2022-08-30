import path from "path";

import { 
	emulator,
	init,
	getAccountAddress,
	shallPass,
	shallResolve,
	shallRevert,
} from "@onflow/flow-js-testing";

import { getNftAdminAddress } from "../src/common";
import {
	deployNftItems,
	getNftItemCount,
	getNftItemSupply,
	mintNftItem,
	setupNftItemsOnAccount,
	transferNftItem,
	types,
	rarities,
} from "../src/nft-items";

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(100000);

describe("Nft Items", () => {
	// Instantiate emulator and path to Cadence files
	beforeEach(async () => {
		const basePath = path.resolve(__dirname, "../../");
		await init(basePath);
		await emulator.start();
	});

	// Stop emulator, so it could be restarted
	afterEach(async () => {
		await emulator.stop();
	});

	it("should deploy NftItems contract", async () => {
		await shallPass(deployNftItems());
	});

	it("supply should be 0 after contract is deployed", async () => {
		// Setup
		await deployNftItems();
		const NftAdmin = await getNftAdminAddress();
		await shallPass(setupNftItemsOnAccount(NftAdmin));

		const [supply] = await shallResolve(getNftItemSupply())
		expect(supply).toBe("0");
	});

	it("should be able to mint a nft item", async () => {
		// Setup
		await deployNftItems();
		const Alice = await getAccountAddress("Alice");
		await setupNftItemsOnAccount(Alice);

		// Mint instruction for Alice account shall be resolved
		await shallPass(mintNftItem(Alice, types.fishbowl, rarities.blue));
	});

	it("should be able to create a new empty NFT Collection", async () => {
		// Setup
		await deployNftItems();
		const Alice = await getAccountAddress("Alice");
		await setupNftItemsOnAccount(Alice);

		// shall be able te read Alice collection and ensure it's empty
		const [itemCount] = await shallResolve(getNftItemCount(Alice))
		expect(itemCount).toBe("0");
	});

	it("should not be able to withdraw an NFT that doesn't exist in a collection", async () => {
		// Setup
		await deployNftItems();
		const Alice = await getAccountAddress("Alice");
		const Bob = await getAccountAddress("Bob");
		await setupNftItemsOnAccount(Alice);
		await setupNftItemsOnAccount(Bob);

		// Transfer transaction shall fail for non-existent item
		await shallRevert(transferNftItem(Alice, Bob, 1337));
	});

	it("should be able to withdraw an NFT and deposit to another accounts collection", async () => {
		await deployNftItems();
		const Alice = await getAccountAddress("Alice");
		const Bob = await getAccountAddress("Bob");
		await setupNftItemsOnAccount(Alice);
		await setupNftItemsOnAccount(Bob);

		// Mint instruction for Alice account shall be resolved
		await shallPass(mintNftItem(Alice, types.fishbowl, rarities.blue));

		// Transfer transaction shall pass
		await shallPass(transferNftItem(Alice, Bob, 0));
	});

	it("misc test", async () => {

	})
});
