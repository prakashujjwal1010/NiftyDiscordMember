import React, { useState, useEffect } from "react";
import { Button, List, Divider, Card, Input, Progress, Spin, Modal } from "antd";
import { LinkOutlined } from '@ant-design/icons';
import { Address, Balance } from "../components";
import StackGrid from "react-stack-grid";


export default function Creations({ itemsList, mainnetProvider, blockExplorer }) {

  if (!itemsList) {
    return <h1>loading..</h1>;
  }
  return (
    <div style={{ maxWidth:820, margin: "auto", marginTop:32, paddingBottom:256 }}>
      <StackGrid
        columnWidth={200}
        gutterWidth={16}
        gutterHeight={16}
      >
        {itemsList.map(item => {
          let cardActions =[];
          let id = item.id.toNumber();
          cardActions.push(
            <div>
              {item.status==0 ? <h4> NOT YET ACTIVATED </h4> :
                (
                  item.status == 1 ? <h4> ACTIVATED </h4> : <h4> ARCHIVED </h4>
                )
              }
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
            <Card style={{width:200}} key={id+"_"+item.uri+"_"+item.owner}
              actions={cardActions}
              title={(
                <div>
                  <span style={{fontSize:16, marginRight:8}}>#{id}</span> {item.name}
                </div>
              )}
            >
              <img style={{maxWidth:130}} src={item.imageUrl}/>
              <div style={{opacity:0.77}}>
                <h5>Creator: {item.creator}</h5>
                <h5>Discord Role: {item.role}</h5>
                <h5>Discord Server: {item.guild ? item.guild : " "}</h5>
                <h5>description: {item.description}</h5>
              </div>
            </Card>
          )
        })}
      </StackGrid>
    </div>
  );
}
