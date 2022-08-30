import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import nftItems from "../../contracts/nftItems.cdc"
import MetadataViews from "../../contracts/MetadataViews.cdc"

// This transaction configures an account to hold Nft Items.

transaction {
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&nftItems.Collection>(from: nftItems.CollectionStoragePath) == nil {

            // create a new empty collection
            let collection <- nftItems.createEmptyCollection()
            
            // save it to the account
            signer.save(<-collection, to: nftItems.CollectionStoragePath)

            // create a public capability for the collection
            signer.link<&nftItems.Collection{NonFungibleToken.CollectionPublic, nftItems.NftItemsCollectionPublic, MetadataViews.ResolverCollection}>(nftItems.CollectionPublicPath, target: nftItems.CollectionStoragePath)
        }
    }
}
