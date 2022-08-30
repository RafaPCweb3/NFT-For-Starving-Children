import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import nftItems from "../../contracts/nftItems.cdc"
import FungibleToken from "../../contracts/FungibleToken.cdc"
import FlowToken from "../../contracts/FlowToken.cdc"
import NFTStorefront from "../../contracts/NFTStorefront.cdc"

// This transction uses the NFTMinter resource to mint a new NFT.

transaction(recipient: Address, kind: UInt8, rarity: UInt8) {

    // local variable for storing the minter reference
    let minter: &nftItems.NFTMinter
    let flowReceiver: Capability<&FlowToken.Vault{FungibleToken.Receiver}>
    let nftItemsProvider: Capability<&nftItems.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>
    let storefront: &NFTStorefront.Storefront

    prepare(signer: AuthAccount) {

        // borrow a reference to the NFTMinter resource in storage
        self.minter = signer.borrow<&nftItems.NFTMinter>(from: nftItems.MinterStoragePath)
            ?? panic("Could not borrow a reference to the NFT minter")

         // We need a provider capability, but one is not provided by default so we create one if needed.
        let nftItemsCollectionProviderPrivatePath = /private/nftItemsCollectionProviderV14

        self.flowReceiver = signer.getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)!

        assert(self.flowReceiver.borrow() != nil, message: "Missing or mis-typed FLOW receiver")

        if !signer.getCapability<&nftItems.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftItemsCollectionProviderPrivatePath)!.check() {
            signer.link<&nftItems.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftItemsCollectionProviderPrivatePath, target: nftItems.CollectionStoragePath)
        }

        self.nftItemsProvider = signer.getCapability<&nftItems.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftItemsCollectionProviderPrivatePath)!

        assert(self.nftItemsProvider.borrow() != nil, message: "Missing or mis-typed nftItems.Collection provider")

        self.storefront = signer.borrow<&NFTStorefront.Storefront>(from: NFTStorefront.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront Storefront")
    }

    execute {
        // get the public account object for the recipient
        let recipient = getAccount(recipient)

        // borrow the recipient's public NFT collection reference
        let receiver = recipient
            .getCapability(nftItems.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")

        // mint the NFT and deposit it to the recipient's collection
        let kindValue = nftItems.Kind(rawValue: kind) ?? panic("invalid kind")
        let rarityValue = nftItems.Rarity(rawValue: rarity) ?? panic("invalid rarity")

        // mint the NFT and deposit it to the recipient's collection
        self.minter.mintNFT(
            recipient: receiver,
            kind: kindValue,
            rarity: rarityValue,
        )

        let saleCut = NFTStorefront.SaleCut(
            receiver: self.flowReceiver,
            amount: nftItems.getItemPrice(rarity: rarityValue)
        )
        
        self.storefront.createListing(
            nftProviderCapability: self.nftItemsProvider,
            nftType: Type<@nftItems.NFT>(),
            nftID: nftItems.totalSupply - 1,
            salePaymentVaultType: Type<@FlowToken.Vault>(),
            saleCuts: [saleCut]
        )
    }
}
