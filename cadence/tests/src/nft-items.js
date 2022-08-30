import { mintFlow, executeScript, sendTransaction, deployContractByName } from "@onflow/flow-js-testing";
import { getNftAdminAddress } from "./common";

export const types = {
	fishbowl: 1,
	fishhat: 2,
	milkshake: 3,
	tuktuk: 4,
	skateboard: 5
};

export const rarities = {
	blue: 1,
	green: 2,
	purple: 3,
	gold: 4
};

/*
 * Deploys NonFungibleToken and nftItems contracts to NftAdmin.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<[{*} txResult, {error} error]>}
 * */
export const deployNftItems = async () => {
	const NFTAdmin = await getNftAdminAddress();
	await mintFlow(NFTAdmin, "10.0");

	await deployContractByName({ to: NFTAdmin, name: "NonFungibleToken" });
	await deployContractByName({ to: NFTAdmin, name: "MetadataViews" });
	return deployContractByName({ to: NFTAdmin, name: "nftItems" });
};

/*
 * Setups nftItems collection on account and exposes public capability.
 * @param {string} account - account address
 * @returns {Promise<[{*} txResult, {error} error]>}
 * */
export const setupNftItemsOnAccount = async (account) => {
	const name = "nftItems/setup_account";
	const signers = [account];

	return sendTransaction({ name, signers });
};

/*
 * Returns nftItems supply.
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64} - number of NFT minted so far
 * */
export const getNftItemSupply = async () => {
	const name = "nftItems/get_nft_items_supply";

	return executeScript({ name });
};

/*
 * Mints nftItem of a specific **itemType** and sends it to **recipient**.
 * @param {UInt64} itemType - type of NFT to mint
 * @param {string} recipient - recipient account address
 * @returns {Promise<[{*} result, {error} error]>}
 * */
export const mintNftItem = async (recipient, itemType, itemRarity) => {
	const NFTAdmin = await getNftAdminAddress();

	const name = "nftItems/mint_nft_item";
	const args = [recipient, itemType, itemRarity];
	const signers = [NFTAdmin];

	return sendTransaction({ name, args, signers });
};

/*
 * Transfers nftItem NFT with id equal **itemId** from **sender** account to **recipient**.
 * @param {string} sender - sender address
 * @param {string} recipient - recipient address
 * @param {UInt64} itemId - id of the item to transfer
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const transferNftItem = async (sender, recipient, itemId) => {
	const name = "nftItems/transfer_nft_item";
	const args = [recipient, itemId];
	const signers = [sender];

	return sendTransaction({ name, args, signers });
};

/*
 * Returns the nftItem NFT with the provided **id** from an account collection.
 * @param {string} account - account address
 * @param {UInt64} itemID - NFT id
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64}
 * */
export const getNftItem = async (account, itemID) => {
	const name = "nftItems/get_nft_item";
	const args = [account, itemID];

	return executeScript({ name, args });
};

/*
 * Returns the number of nft Items in an account's collection.
 * @param {string} account - account address
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64}
 * */
export const getNftItemCount = async (account) => {
	const name = "nftItems/get_collection_length";
	const args = [account];

	return executeScript({ name, args });
};
