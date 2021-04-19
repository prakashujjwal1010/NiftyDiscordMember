import React, { useState, useEffect } from "react";
import { Button, List, Divider, Card, Input, Progress, Spin, Modal, Alert } from "antd";
import { LinkOutlined } from '@ant-design/icons';
import { Address, Balance } from "../components";
import StackGrid from "react-stack-grid";
import { get, getBot, post } from "../helpers/api";
import { colorToHexString } from "../helpers/functions";


const animalsImageUrls = ["https://austingriffith.com/images/paintings/buffalo.jpg",
  "https://austingriffith.com/images/paintings/zebra.jpg",
  "https://austingriffith.com/images/paintings/rhino.jpg",
  "https://austingriffith.com/images/paintings/fish.jpg",
  "https://austingriffith.com/images/paintings/flamingo.jpg",
  "https://austingriffith.com/images/paintings/godzilla.jpg",
  "https://austingriffith.com/images/paintings/antelope.jpg",
  "https://austingriffith.com/images/paintings/bear.jpg",
  "https://austingriffith.com/images/paintings/elephant.jpg",
  "https://austingriffith.com/images/paintings/hippo.jpg",
  "https://austingriffith.com/images/paintings/lobster.jpg",
  "https://austingriffith.com/images/paintings/mountaingoat.jpg",
  "https://austingriffith.com/images/paintings/octopus.jpg",
  "https://austingriffith.com/images/paintings/ox.jpg",
  "https://austingriffith.com/images/paintings/penguin.jpg",
  "https://austingriffith.com/images/paintings/walrus.jpg",
  "https://austingriffith.com/images/paintings/killerwhale.jpg"]

function getRandomImageUrl() {
  return animalsImageUrls[Math.floor(Math.random()*animalsImageUrls.length)];
}

export default function Gallery({ address, tx, writeContracts, mainnetProvider, blockExplorer, ipfs }) {
  const [serverSelected, setServerSelected] = useState();
  const [channelsSelected, setChannelsSelected] = useState([]);
  const [servers, setServers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [user, setUser] = useState();
  const [modalUp, setModalUp] = useState("down");
  const [modalUp2, setModalUp2] = useState("down");
  const [form, setForm] = useState({});
  const [ipfsHash, setIpfsHash] = useState();

  //const channels = ['nifty-discord-text', 'Nifty-Discord-Voice'];
  const categoryName = 'NIFTY-DISCORD-MEMBERS';

  useEffect(()=>{
    const loadUserData = async () => {
      const me = await get('https://discord.com/api/v8/users/@me');
      setUser(me);
      let myServers = await get('https://discord.com/api/v8/users/@me/guilds');
      myServers = myServers.filter(item => item.owner==true);
      if(myServers.length>0){
        setServerSelected(myServers[0]);
      }
      setServers(myServers);
    }
    loadUserData();
  }, [])

  useEffect(()=>{
    const loadUserData = async () => {
      if(!serverSelected) return;
      let mRoles = await get(`http://localhost:3050/api/guilds/${serverSelected.id}/roles`);
      setRoles(mRoles);
      let myChannels = await get(`http://localhost:3050/api/guilds/${serverSelected.id}/channels`);
      myChannels = myChannels.filter(item => item.type!=="category");
      setChannels(myChannels);
      console.log(myChannels);
    }
    loadUserData();
  }, [serverSelected])

  useEffect(()=>{
    let upd = {}
    for (var i = 0; i < roles.length; i++) {
      const id = roles[i].id;
      upd[id] = {imageUrl: getRandomImageUrl()}
    }
    setForm({ ...form, ...upd})
  },[roles])

  return (
    <div style={{ maxWidth:820, margin: "auto", marginTop:32, paddingBottom:256 }}>
      <div style={{margin: "auto", marginTop:10}}>
        <Button
          size="large"
          block
          shape="round"
          onClick={() => {
            setModalUp("up");
          }}
          style={{backgroundColor: serverSelected ? "green" : "red"}}
        >
         <b>{serverSelected ? serverSelected.name : "SELECT SERVER"}</b>
        </Button>
        <Modal
          title="SELECT SERVER"
          visible={modalUp === "up"}
          onCancel={() => {
            setModalUp("down");
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setModalUp("down");
              }}
            >
              cancel
            </Button>,
          ]}
        >
          {servers.map(item => {
            return(
              <p key={item.id}>
                <Button
                  size="large"
                  shape="round"
                  onClick={async () => {
                    setServerSelected(item);
                    setModalUp("down");
                  }}
                >
                  {item.name}({item.id})
                </Button>
              </p>
            )
          })}
        </Modal>
      </div>
      <div style={{margin: "auto", marginTop:10}}>
        <Button
          size="large"
          block
          shape="round"
          onClick={() => {
            setModalUp2("up");
          }}
          style={{backgroundColor: channelsSelected.length!=0 ? "green" : "red"}}
        >
         <b>{channelsSelected.length!=0 ? "Channels" : "SELECT CHANNELS(PRIVATE ONES WOULD BE BETTER)"}</b>
        </Button>
        <Modal
          title="SELECT CHANNELS"
          visible={modalUp2 === "up"}
          onCancel={() => {
            setModalUp2("down");
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setModalUp2("down");
              }}
            >
              cancel
            </Button>,
          ]}
        >
          {channels.map(item => {
            return(
              <p key={item.id}>
                <Button
                  size="large"
                  shape="round"
                  onClick={async () => {
                    let update = [...channelsSelected];
                    const present = update.findIndex(ele => ele.id === item.id);
                    if(present===-1){
                      update.push(item);
                    } else {
                      update.splice(present,1);
                    }
                    setChannelsSelected(update);
                  }}
                  style={{backgroundColor: channelsSelected.findIndex(ele => ele.id === item.id) != -1? "green" : ""}}
                >
                  {item.name}({item.id})
                </Button>
              </p>
            )
          })}
        </Modal>
      </div>
      <Divider/>
      <StackGrid
        columnWidth={250}
        gutterWidth={16}
        gutterHeight={16}
      >
        {roles.map((item, index) => {
          let cardActions =[];
          let id = item.id;
          cardActions.push(
            <div>
              <div>
              🖼️ <Input
                size="small"
                style={{width:180, margin: "auto", marginTop:10}}
                placeholder="Enter image url for NFT"
                autoComplete="off"
                value={form[id] ? form[id].imageUrl : "https://austingriffith.com/images/paintings/buffalo.jpg"}
                name="imageUrl"
                onChange={(e)=>{
                  const newValue = e.target.value;
                  let update = {}
                  update[id] = {...form[id], imageUrl: newValue}
                  setForm({ ...form, ...update})
                  //console.log(form);
                }}
              />
              </div>
              <div>
              📜 <Input
                size="small"
                style={{width:180, margin: "auto", marginTop:10}}
                placeholder="Enter Description for NFT"
                autoComplete="off"
                value={form[id] ? form[id].description : ""}
                name="description"
                onChange={(e)=>{
                  const newValue = e.target.value;
                  let update = {}
                  update[id] = {...form[id], description: newValue}
                  setForm({ ...form, ...update})
                  //console.log(form);
                }}
              />
              </div>
              <h4 style={{margin: "auto", marginTop:10}}>
                SERVER: <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                  {serverSelected ? serverSelected.name : ""}
                </span>
              </h4>
              <h4 style={{margin: "auto", marginTop:10}}>
                Channels: {channelsSelected.map((channelItem, indxx) => {
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
              <Button style={{margin: "auto", marginTop:10}} disabled={channelsSelected.length==0 || !serverSelected} onClick={async ()=>{
                if(!serverSelected) {
                  console.log('select server please!');
                  return ;
                }

                if(channelsSelected.length==0) {
                  console.log('select channels please!');
                  return ;
                }

                if(!form[id].description || form[id].description=="") {
                  console.log('enter description please!');
                  return ;
                }
                //genrating ipfs hash
                let yourJSON = {
                  name: item.name,
                  external_url:"https://github.com/prakashujjwal1010/NiftyDiscordMember",
                  image: form[id].imageUrl,
                  description: form[id].description,
                  background_color: item.color,
                  role: item.name,
                  rank: item.rank,
                  guild: (serverSelected ? serverSelected.name : "" ),
                  creator: user.username,
                  channels: channelsSelected,
                  attributes:[
                    {
                      trait_type: "Role's rank",
                      value: item.rank
                    },
                    {
                      trait_type: "Role",
                      value: item.name
                    },
                    {
                      trait_type: "channels to access",
                      value: channelsSelected
                    },
                    {
                      trait_type: "creator",
                      value: user.username
                    },
                    {
                      trait_type: "server",
                      value: serverSelected.name
                    },
                  ]
                }
                console.log("UPLOADING...",yourJSON)
                const result = await ipfs.add(JSON.stringify(yourJSON))//addToIPFS(JSON.stringify(yourJSON))
                if(result && result.path) {
                  console.log("RESULT:",result)
                  tx( writeContracts.YourCollectible.mintItem(address,result.path,serverSelected.id))
                }
              }}>
                Mint
              </Button>
            </div>
          )

          return(
            <Card style={{width:250, backgroundColor: colorToHexString(item.color)}} key={id+"_"+item.name}
              actions={cardActions}
              title={(
                <div>
                  {item.name}
                </div>
              )}
            >
              <img style={{maxWidth:130, backgroundColor: colorToHexString(item.color)}} src={form[id] ? form[id].imageUrl : "https://austingriffith.com/images/paintings/buffalo.jpg"}/>
            </Card>
          )
        })}
      </StackGrid>

    </div>
  );
}
