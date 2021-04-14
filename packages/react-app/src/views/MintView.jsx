import React, { useState, useEffect } from "react";
import { Button, List, Divider, Card, Input, Progress, Spin, Modal, Alert } from "antd";
import { LinkOutlined } from '@ant-design/icons';
import { Address, Balance } from "../components";
import StackGrid from "react-stack-grid";
import { get, getBot, post } from "../helpers/api";


export default function MintView({ itemsList, address, tx, writeContracts, mainnetProvider, blockExplorer, ipfs }) {
  const [serverSelected, setServerSelected] = useState();
  const [servers, setServers] = useState([]);
  const [user, setUser] = useState();
  const [modalUp, setModalUp] = useState("down");
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "https://austingriffith.com/images/paintings/buffalo.jpg",
    role: "",
  });
  const [ipfsHash, setIpfsHash] = useState();

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

  const onChange = (event) => {
    const formUpdate = { ...form };
    formUpdate[event.target.name] = event.target.value;
    setForm(formUpdate);
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
      <Card style={{width:640, margin: "auto"}}
        actions={[
          (<div>

            <Input
              size="small"
              placeholder="Enter image url for NFT"
              autoComplete="off"
              value={form.imageUrl}
              name="imageUrl"
              onChange={onChange}
              style={{width:600, margin: "auto", marginTop:20}}
            />

            <Input
              size="small"
              placeholder="Enter Discord Role"
              autoComplete="off"
              value={form.role}
              name="role"
              onChange={onChange}
              style={{width:600, margin: "auto", marginTop:20}}
            />

            <Input
              size="small"
              placeholder="Enter Discription"
              autoComplete="off"
              value={form.description}
              name="description"
              onChange={onChange}
              style={{width:600, margin: "auto", marginTop:20}}
            />

            <Button onClick={async ()=>{
              if(!serverSelected) {
                console.log('select server please!');
                return ;
              }
              //genrating ipfs hash
              let yourJSON = {
                ...form,
                guild: (serverSelected ? serverSelected.name : "" ),
                creator: user.name,
                channels: channels
              }
              console.log("UPLOADING...",yourJSON)
              const result = await ipfs.add(JSON.stringify(yourJSON))//addToIPFS(JSON.stringify(yourJSON))
              if(result && result.path) {
                setIpfsHash(result.path)
                console.log("RESULT:",result)
                tx( writeContracts.YourCollectible.mintItem(address,result.path,serverSelected.id))
              }

            }}>
              Mint
            </Button>
          </div>)
        ]}
        title={(
          <div>
            <Input
            size="small"
            placeholder="Enter Name of NFT"
            autoComplete="off"
            value={form.name}
            name="name"
            onChange={onChange}
          />
        </div>
        )}
      >
        <img style={{maxWidth:300}} src={form.imageUrl}/>
        <div style={{opacity:0.77}}>
          {form.description}
        </div>
      </Card>
    </div>
  );
}
