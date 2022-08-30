import nftItems from "../../contracts/nftItems.cdc"

// This scripts returns the number of nftItems currently in existence.

pub fun main(): UInt64 {    
    return nftItems.totalSupply
}
