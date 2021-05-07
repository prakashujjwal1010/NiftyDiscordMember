import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import {  JsonRpcProvider, StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import {  LinkOutlined } from "@ant-design/icons"
import "./App.css";
import { Row, Col, Button, Menu, Alert, Input, List, Card, Switch as SwitchD } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address, AddressInput, ThemeSwitch, LogInDiscord } from "./components";
import { Transactor } from "./helpers";
import { formatEther, parseEther } from "@ethersproject/units";
import { utils } from "ethers";
import { Home, ExampleUI, Subgraph, NoWalletDetected, RedirectPage, MintView, Creations, Gallery } from "./views"
import { useThemeSwitcher } from "react-css-theme-switcher";
import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS } from "./constants";
import StackGrid from "react-stack-grid";
import ReactJson from 'react-json-view'
import assets from './assets.js'
import { defaultAbiCoder } from "@ethersproject/abi"
import { get, getBot, post } from "./helpers/api";
import { colorToHexString } from "./helpers/functions";
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2({
    clientId: process.env.REACT_APP_DISCORD_CLIENT_ID,
    clientSecret: process.env.REACT_APP_DISCORD_CLIENT_SECRET,
    redirectUri: process.env.REACT_APP_DISCORD_REDIRECT_URI,
});

const { BufferList } = require('bl')
// https://www.npmjs.com/package/ipfs-http-client
const ipfsAPI = require('ipfs-http-client');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

console.log("📦 Assets: ",assets)

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS['goerli']; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = false

//EXAMPLE STARTING JSON:
const STARTING_JSON = {
  "description": "It's actually a bison?",
  "external_url": "https://austingriffith.com/portfolio/paintings/",// <-- this can link to a page for the specific file too
  "image": "https://austingriffith.com/images/paintings/buffalo.jpg",
  "name": "Buffalo",
  "attributes": [
     {
       "trait_type": "BackgroundColor",
       "value": "green"
     },
     {
       "trait_type": "Eyes",
       "value": "googly"
     }
  ]
}

//helper function to "Get" from IPFS
// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    if(DEBUG) console.log(file.path)
    if (!file.content) continue;
    const content = new BufferList()
    for await (const chunk of file.content) {
      content.append(chunk)
    }
    if(DEBUG) console.log(content)
    return content
  }
}

// 🛰 providers
if(DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
//const scaffoldEthProvider = new JsonRpcProvider("https://rpc.scaffoldeth.io:48544")
const mainnetInfura = new StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

// 🏠 Your local provider is usually pointed at your local blockchain
/*const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if(DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
//const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);
let localProvider = null;
*/

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;
let sf;

function App(props) {

  //const mainnetProvider = (scaffoldEthProvider && scaffoldEthProvider._network) ? scaffoldEthProvider : mainnetInfura
  const mainnetProvider = mainnetInfura;
  if(DEBUG) console.log("🌎 mainnetProvider",mainnetProvider)

  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork,mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  //const gasPrice = useGasPrice(targetNetwork,"fast");
  let gasPrice;
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, null);

  const address = useUserAddress(userProvider);
  if(DEBUG) console.log("👩‍💼 selected address:",address)

  // You can warn the user if you would like them to be on a specific network
  let localChainId = userProvider && userProvider._network && userProvider._network.chainId
  if(DEBUG) console.log("🏠 localChainId",localChainId)

  let selectedChainId = userProvider && userProvider._network && userProvider._network.chainId
  if(DEBUG) console.log("🕵🏻‍♂️ selectedChainId:",selectedChainId)

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice)

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(userProvider, address);
  if(DEBUG) console.log("💵 yourLocalBalance",yourLocalBalance?formatEther(yourLocalBalance):"...")

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(userProvider)
  if(DEBUG) console.log("📝 readContracts",readContracts)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider)
  if(DEBUG) console.log("🔐 writeContracts",writeContracts)

  // keep track of a variable from the contract in the local React state:
  const balance = useContractReader(readContracts,"YourCollectible", "balanceOf", [ address ])
  if(DEBUG) console.log("🤗 balance:",balance)
  const creatorBalance = useContractReader(readContracts,"YourCollectible", "getNoOfTokensCreated", [ address ])
  if(DEBUG) console.log("🤗 creatorBalance:",creatorBalance)


  //📟 Listen for broadcast events
  const transferEvents = useEventListener(readContracts, "YourCollectible", "Transfer", userProvider, 1);
  if(DEBUG) console.log("📟 Transfer events:",transferEvents)

  // initializing superfluid
  useEffect(() => {
    const loadSuperfluid = async () => {
      if(injectedProvider){
        sf = new SuperfluidSDK.Framework({
          ethers: injectedProvider
        });
        try{
          await sf.initialize()
          console.log(sf);
        } catch(e){
          console.log(e);
        }
      }
    }
    loadSuperfluid();
  }, [injectedProvider])

  const yourBalance = balance && balance.toNumber && balance.toNumber()
  const [ yourCollectibles, setYourCollectibles ] = useState()
  const updateYourCollectibles = async () => {
    let collectibleUpdate = []
    for(let tokenIndex=0;tokenIndex<balance;tokenIndex++){
      try{
        const tokenId = await readContracts.YourCollectible.tokenOfOwnerByIndex(address, tokenIndex)
        const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId)
        let tokenStatus = await readContracts.YourCollectible.getTokenStatus(tokenId)
        tokenStatus = tokenStatus.toNumber();
        const ipfsHash =  tokenURI.replace("https://ipfs.io/ipfs/","")
        console.log("ipfsHash",ipfsHash)

        const jsonManifestBuffer = await getFromIPFS(ipfsHash)

        try{
          const jsonManifest = JSON.parse(jsonManifestBuffer.toString())
          //console.log("jsonManifest",jsonManifest)
          collectibleUpdate.push({ ...jsonManifest, id:tokenId, uri:tokenURI, status: tokenStatus, owner: address })
        }catch(e){console.log(e)}

      }catch(e){console.log(e)}
    }
    setYourCollectibles(collectibleUpdate)
  }
  useEffect(()=>{
    updateYourCollectibles()
  },[ address, yourBalance ])

  const totalTokensCreated = creatorBalance && creatorBalance.toNumber && creatorBalance.toNumber()
  const [ yourCreations, setYourCreations ] = useState()
  const updateYourCreations = async () => {
    let collectibleUpdate = []
    for(let tokenIndex=0;tokenIndex<creatorBalance;tokenIndex++){
      try{
        const tokenId = await readContracts.YourCollectible.tokenOfCreatorByIndex(address, tokenIndex)
        const owner = await readContracts.YourCollectible.ownerOf(tokenId)
        const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId)
        let tokenStatus = await readContracts.YourCollectible.getTokenStatus(tokenId)
        tokenStatus = tokenStatus.toNumber();
        let ownerDiscordID = await readContracts.YourCollectible.getTokenOwnerDiscordID(tokenId)
        const ipfsHash =  tokenURI.replace("https://ipfs.io/ipfs/","")
        const jsonManifestBuffer = await getFromIPFS(ipfsHash)

        try{
          const jsonManifest = JSON.parse(jsonManifestBuffer.toString())
          console.log("jsonManifest",jsonManifest)
          const obj =
          collectibleUpdate.push({ ...jsonManifest, id:tokenId, uri:tokenURI, status: tokenStatus, ownerDiscordID:ownerDiscordID, owner: owner })
        }catch(e){console.log(e)}

      }catch(e){console.log(e)}
    }
    setYourCreations(collectibleUpdate)
  }
  useEffect(()=>{
    updateYourCreations()
  },[ address, totalTokensCreated ])


  let networkDisplay = ""
  if(localChainId && selectedChainId && localChainId != selectedChainId ){
    networkDisplay = (
      <div style={{zIndex:2, position:'absolute', right:0,top:60,padding:16}}>
        <Alert
          message={"⚠️ Wrong Network"}
          description={(
            <div>
              You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on <b>{NETWORK(localChainId).name}</b>.
            </div>
          )}
          type="error"
          closable={false}
        />
      </div>
    )
  }else{
    networkDisplay = (
      <div style={{zIndex:-1, position:'absolute', right:154,top:28,padding:16,color:targetNetwork.color}}>
        {targetNetwork.name}
      </div>
    )
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname)
  }, [setRoute]);

  const [expiryTime, setExpiryTime] = useState('0');
  const [user, setUser] = useState();

  useEffect(()=>{
    const loadUserData = async () => {
      let expTime;
      try {
        expTime = JSON.parse(localStorage.getItem('expiry_time'));
      } catch (error) {
        expTime = '0';
      }
      setExpiryTime(expTime);
      const me = await get('https://discord.com/api/v8/users/@me');
      setUser(me);
    }
    loadUserData();
  },[])

  const isValidSession = () => {
    const currentTime = new Date().getTime();
    const isSessionValid = currentTime < expiryTime;
    return isSessionValid;
  };


  const [ yourJSON, setYourJSON ] = useState( STARTING_JSON );
  const [ sending, setSending ] = useState()
  const [ ipfsHash, setIpfsHash ] = useState()
  const [ ipfsDownHash, setIpfsDownHash ] = useState()

  const [ downloading, setDownloading ] = useState()
  const [ ipfsContent, setIpfsContent ] = useState()

  const [ transferToAddresses, setTransferToAddresses ] = useState({})

  if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

  return (
    <div className="App">

      <Header />
      {networkDisplay}
      <BrowserRouter>

        <Menu style={{ textAlign:"center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={()=>{setRoute("/")}} to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="/gallery">
            <Link onClick={()=>{setRoute("/gallery")}} to="/gallery">Gallery</Link>
          </Menu.Item>
          <Menu.Item key="/creations">
            <Link onClick={()=>{setRoute("/creations")}} to="/creations">Created</Link>
          </Menu.Item>
          <Menu.Item key="/yourcollectibles">
            <Link onClick={()=>{setRoute("/yourcollectibles")}} to="/yourcollectibles">Owned</Link>
          </Menu.Item>
          <Menu.Item key="/transfers">
            <Link onClick={()=>{setRoute("/transfers")}} to="/transfers">Transfers</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route
          exact
            path="/"
            render={(props) => (
              <Home
                oauth={oauth}
                isValidSession={isValidSession}
                setExpiryTime={setExpiryTime}
                {...props}
              />
            )}
          />

          <Route
            exact
            path="/redirect"
            render={(props) => (
              <RedirectPage
                isValidSession={isValidSession}
                setExpiryTime={setExpiryTime}
                {...props}
              />
            )}
          />

          <Route exact path="/gallery">
            {!isValidSession() ? (
              <LogInDiscord />
            ): (
              <Gallery
                address={address}
                tx={tx}
                writeContracts={writeContracts}
                mainnetProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                ipfs={ipfs}
              />
            )}
          </Route>
          <Route exact path="/create">
            {!isValidSession() ? (
              <LogInDiscord />
            ): (
              <MintView
                address={address}
                tx={tx}
                writeContracts={writeContracts}
                mainnetProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                ipfs={ipfs}
              />
            )}
          </Route>
          <Route exact path="/creations">
            <Creations
              itemsList={yourCreations}
              mainnetProvider={mainnetProvider}
              blockExplorer={blockExplorer}
            />
          </Route>

          <Route path="/yourcollectibles">
            {!isValidSession() ? (
              <LogInDiscord />
            ): (
              <div style={{ width:820, margin: "auto", marginTop:32, paddingBottom:32 }}>
                <List
                  bordered
                  dataSource={yourCollectibles}
                  renderItem={(item) => {
                    const id = item.id.toNumber()
                    return (
                      <List.Item key={id+"_"+item.uri+"_"+item.owner}>
                        <Card style={{width:400, backgroundColor: colorToHexString(item.background_color)}} title={(
                          <div style={{margin: "auto", marginTop:10}}>
                            #<span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                              {id} {item.name}
                            </span>
                          </div>
                        )}>
                          <div><img src={item.image} style={{maxWidth:150}} /></div>
                          <h4 style={{margin: "auto", marginTop:10}}>
                            STATUS: <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                            {item.status==0 ?  "NOT YET ACTIVATED"  :
                              (
                                item.status == 1 ?  "ACTIVATED"  : "ARCHIVED"
                              )
                            }
                            </span>
                          </h4>
                          <h4 style={{margin: "auto", marginTop:10}}>
                            CREATOR: <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                              {item.creator}
                            </span>
                          </h4>
                          <h4 style={{margin: "auto", marginTop:10}}>
                            SERVER: <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                              {item.guild ? item.guild : " "}
                            </span>
                          </h4>
                          <h4 style={{margin: "auto", marginTop:10}}>
                            CHANNELS: {item.channels.map((channelItem, indxx) => {
                              return(
                                <span key={"channelName-"+channelItem.id+"-"+id+"-"+indxx} class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                                  {channelItem.name}
                                </span>
                              )
                            })}
                          </h4>
                          <h4 style={{margin: "auto", marginTop:10}}>
                            RANK: <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                              {item.rank}
                            </span>
                          </h4>
                        </Card>

                        <div>
                        {item.status==0 ?
                          (
                            <div style={{marginTop:20}}>
                              <Button onClick={async () => {
                                console.log("starting superfluid constant flow");
                                //start superfluid stream
                                if(sf){
                                  await sf.cfa.createFlow({
                                    flowRate: '385802469135802',
                                    receiver: readContracts.YourCollectible.address,
                                    sender: address,
                                    superToken: '0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00',
                                    userData: defaultAbiCoder.encode(["uint256", "uint256"], [id, user.id]),
                                  });
                                  updateYourCollectibles();
                                  updateYourCreations();
                                }
                              }}>
                                Activate Access
                              </Button>
                            </div>
                          ) : (item.status === 1 ?
                            (
                              <div style={{marginTop:20}}>
                                <Button onClick={async () => {
                                  console.log("stopping superfluid constant flow");
                                  //stoppping superfluid stream
                                  if(sf){
                                    await sf.cfa.deleteFlow({
                                      by: address,
                                      receiver: readContracts.YourCollectible.address,
                                      sender: address,
                                      superToken: '0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00',
                                      userData: defaultAbiCoder.encode(["uint256", "uint256"], [id, user.id]),
                                    });
                                    updateYourCollectibles();
                                    updateYourCreations();
                                  }

                                }}>
                                  Deactivate Access
                                </Button>
                              </div>
                            ) : (
                              <h4 style={{margin: "auto", marginTop:10}}>
                                <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                                  TOKEN ARCHIVED
                                </span>
                              </h4>
                            )
                          )
                        }
                          <h4 style={{margin: "auto", marginTop:10}}>
                            Your Discord: <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                              {user && (user.username)} ({user && (user.id)} )
                            </span>
                          </h4>
                          <h4 style={{margin: "auto", marginTop:10}}>
                            FEESRATE: <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                              385802469135802 xDAI
                            </span>
                          </h4>
                          <h4 style={{margin: "auto", marginTop:10}}>
                            OWNER: <span style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                              <Address
                                  address={item.owner}
                                  ensProvider={mainnetProvider}
                                  blockExplorer={blockExplorer}
                                  fontSize={16}
                              />
                            </span>
                          </h4>

                          <AddressInput
                            style={{marginTop:32}}
                            ensProvider={mainnetProvider}
                            placeholder="transfer to address"
                            value={transferToAddresses[id]}
                            onChange={(newValue)=>{
                              let update = {}
                              update[id] = newValue
                              setTransferToAddresses({ ...transferToAddresses, ...update})
                            }}
                            key={id+"_"+item.uri+"_"+item.owner}
                          />
                          <Button style={{marginTop:10}} onClick={()=>{
                            console.log("writeContracts",writeContracts)
                            tx( writeContracts.YourCollectible.transferFrom(address, transferToAddresses[id], id) )
                          }}>
                            Transfer
                          </Button>
                        </div>
                      </List.Item>
                    )
                  }}
                />
              </div>
            )}
          </Route>

          <Route path="/transfers">
            <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:32 }}>
              <List
                bordered
                dataSource={transferEvents}
                renderItem={(item) => {
                  return (
                    <List.Item key={item[0]+"_"+item[1]+"_"+item.blockNumber+"_"+item[2].toNumber()}>
                      <span style={{fontSize:16, marginRight:8}}>#{item[2].toNumber()}</span>
                      <Address
                          address={item[0]}
                          ensProvider={mainnetProvider}
                          fontSize={16}
                      /> =>
                      <Address
                          address={item[1]}
                          ensProvider={mainnetProvider}
                          fontSize={16}
                      />
                    </List.Item>
                  )
                }}
              />
            </div>
          </Route>

          <Route path="/ipfsdown">
              <div style={{ paddingTop:32, width:740, margin:"auto" }}>
                <Input
                  value={ipfsDownHash}
                  placeHolder={"IPFS hash (like QmadqNw8zkdrrwdtPFK1pLi8PPxmkQ4pDJXY8ozHtz6tZq)"}
                  onChange={(e)=>{
                    setIpfsDownHash(e.target.value)
                  }}
                />
              </div>
              <Button style={{margin:8}} loading={sending} size="large" shape="round" type="primary" onClick={async()=>{
                  console.log("DOWNLOADING...",ipfsDownHash)
                  setDownloading(true)
                  setIpfsContent()
                  const result = await getFromIPFS(ipfsDownHash)//addToIPFS(JSON.stringify(yourJSON))
                  if(result && result.toString) {
                    setIpfsContent(result.toString())
                  }
                  setDownloading(false)
              }}>Download from IPFS</Button>

              <pre  style={{padding:16, width:500, margin:"auto",paddingBottom:150}}>
                {ipfsContent}
              </pre>
          </Route>
        </Switch>
      </BrowserRouter>

      <ThemeSwitch />


      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
         <Account
           address={address}
           localProvider={userProvider}
           userProvider={userProvider}
           mainnetProvider={mainnetProvider}
           price={price}
           web3Modal={web3Modal}
           loadWeb3Modal={loadWeb3Modal}
           logoutOfWeb3Modal={logoutOfWeb3Modal}
           blockExplorer={blockExplorer}
         />
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
       <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
         <Row align="middle" gutter={[4]}>
           <Col span={12}>
             <Ramp price={price} address={address} networks={NETWORKS}/>
           </Col>
           <Col span={12} style={{ textAlign: "center", opacity: 1 }}>
             <Button
               onClick={() => {
                 window.open("https://github.com/prakashujjwal1010/NiftyDiscordMember");
               }}
               size="large"
               shape="round"
             >
               <span style={{ marginRight: 8 }} role="img" aria-label="support">
                 💬
               </span>
               Support
             </Button>
           </Col>
         </Row>
       </div>

    </div>
  );
}


/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

 window.ethereum && window.ethereum.on('chainChanged', chainId => {
  setTimeout(() => {
    window.location.reload();
  }, 1);
})

export default App;
