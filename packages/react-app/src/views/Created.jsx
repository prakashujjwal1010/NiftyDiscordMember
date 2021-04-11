import React, { useState, useEffect } from "react";
import { Button, List, Divider, Card, Input, Progress, Spin, Modal } from "antd";
import { LinkOutlined } from '@ant-design/icons';
import { Address, Balance } from "../components";
import StackGrid from "react-stack-grid";
import { get, getBot, post } from "../helpers/api";


export default function MintView({ itemsList, address, tx, writeContracts, mainnetProvider, blockExplorer }) {
  const [serverSelected, setServerSelected] = useState();
  const [servers, setServers] = useState([]);
  const [user, setUser] = useState();
  const [modalUp, setModalUp] = useState("down");

  const channels = ['nifty-discord-text', 'Nifty-Discord-Voice'];
  const categoryName = 'NIFTY-DISCORD-MEMBERS';

  useEffect(()=>{
    const loadUserData = async () => {
      const me = await get('https://discord.com/api/v8/users/@me');
      setUser(me);
      //console.log(me);
      let myServers = await get('https://discord.com/api/v8/users/@me/guilds');
      myServers = myServers.filter(item => item.owner==true);
      setServers(myServers);
      //console.log(myServers);
    }
    loadUserData();
  }, [])

  if (!itemsList) {
    return null;
  }

  return (
    <div style={{ maxWidth:820, margin: "auto", marginTop:32, paddingBottom:256 }}>
      <div>
        <Button
          size="large"
          block
          shape="round"
          onClick={() => {
            setModalUp("up");
          }}
        >
         {serverSelected ? serverSelected.name : "SELECT SERVER"}
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
                  style={{color:item.color}}
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
      <br></br>
      <h3 style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🛰</span>
        <b>Private channels for NiftyDiscord: </b>
        <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          {channels[0]}, {channels[1]}
        </span>
      </h3>


      <Divider/>
      <StackGrid
        columnWidth={200}
        gutterWidth={16}
        gutterHeight={16}
      >
        {itemsList.map(item => {
          let cardActions =[];
          if(item.forSale){
            cardActions.push(
              <div>
                <Button onClick={()=>{
                  tx( writeContracts.YourCollectible.mintItem(item.id) )
                }}>
                  Mint
                </Button>
              </div>
            )
          }else{
            cardActions.push(
              <div>
                owned by: <Address
                  address={item.owner}
                  ensProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  minimized={true}
                />
              </div>
            )
          }
          return(
            <Card style={{width:200}} key={item.name}
              actions={cardActions}
              title={(
                <div>
                  {item.name} <a style={{cursor:"pointer",opacity:0.33}} href={item.external_url} target="_blank"><LinkOutlined /></a>
                </div>
              )}
            >
              <img style={{maxWidth:130}} src={item.image}/>
              <div style={{opacity:0.77}}>
                {item.description}
              </div>
            </Card>
          )
        })}
      </StackGrid>
    </div>
  );
}
