import React, { useState, useEffect } from "react";
import { Button, List, Divider, Card, Input, Progress, Spin, Modal } from "antd";
import { LinkOutlined } from '@ant-design/icons';
import { Address, Balance } from "../components";
import StackGrid from "react-stack-grid";
import { colorToHexString } from "../helpers/functions";


export default function Creations({ itemsList, mainnetProvider, blockExplorer }) {

  if (!itemsList) {
    return <h1>loading..</h1>;
  }
  return (
    <div style={{ maxWidth:820, margin: "auto", marginTop:32, paddingBottom:256 }}>
      <StackGrid
        columnWidth={250}
        gutterWidth={16}
        gutterHeight={16}
      >
        {itemsList.map(item => {
          let cardActions =[];
          console.log(item);
          let id = item.id.toNumber();
          cardActions.push(
            <div>
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
                SERVER: <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                  {item.guild ? item.guild : " "}
                </span>
              </h4>
              <h4 style={{margin: "auto", marginTop:10}}>
                Channels: {item.channels.map((channelItem, indxx) => {
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
              <h4 style={{margin: "auto", marginTop:10}}>
                FEESRATE: <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
                  385802469135802 xDAI
                </span>
              </h4>
              <div>
                <h4>owned by: </h4>
                <Address
                  address={item.owner}
                  ensProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  minimized={true}
                />
                {item.status==1 ? <h4>owner discordID: {item.ownerDiscordID}</h4> : ""}
              </div>
            </div>
          )

          return(
            <Card style={{width:250, backgroundColor: colorToHexString(item.background_color)}} key={id+"_"+item.uri+"_"+item.owner}
              actions={cardActions}
              title={(
                <div>
                  <span style={{fontSize:16, marginRight:8}}>#{id}</span> {item.name}
                </div>
              )}
            >
              <img style={{maxWidth:130}} src={item.image}/>
            </Card>
          )
        })}
      </StackGrid>
    </div>
  );
}
