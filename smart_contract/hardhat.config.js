//https://eth-goerli.g.alchemy.com/v2/eW3bT_g3AR_rQZ1YMdS_VVDrMxyVEjPg

require('@nomiclabs/hardhat-waffle'
)

module.exports={
  solidity:'0.8.0',
  networks:{
    rinkeby:{
      url:'https://eth-rinkeby.alchemyapi.io/v2/eW3bT_g3AR_rQZ1YMdS_VVDrMxyVEjPg',
      accounts:['54b160a5f23c4bb80fd013dc52603ef51fbe05d2dad6c12b3b77a17e9bf51c42']
    }
  }
}
