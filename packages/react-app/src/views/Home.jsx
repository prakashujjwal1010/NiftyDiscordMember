import React, { useState } from "react";
import { Address, AddressInput, LogInDiscord } from "../components";
import { Select, Button, Row, Col, Card } from "antd";

const { Option } = Select;

export default function Home({oauth, isValidSession, setExpiryTime}) {

  if(isValidSession()) {
    return(
      <div>
        <h1 style={{ margin: 20 }}>
          <span style={{ marginRight: 8 }}>🛰</span>
          <b>Welcome</b> to
          <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            NiftyDiscord Members
          </span>
        </h1>

        <h2 style={{ width: 800, margin: "auto" }}>
          NiftyDiscordMember is a platform where one can tokenize roles, channels of one's Discord servers.
          Buyers can buy NFT and access the creator's private channels by starting superfluid stream using NFT.
        </h2>

        <h2 style={{ marginTop: 10 }}>
          <div style={{ width: 350, padding: 16, margin: "auto" }}>
            <Button type="primary" shape="round" size="large" block onClick={async ()=>{
              setExpiryTime('0');
              if(localStorage.getItem('params')){
                localStorage.removeItem('params');
              }
              if(localStorage.getItem('expiry_time')){
                localStorage.removeItem('expiry_time');
              }

            }}>
              LOG OUT FROM DISCORD
            </Button>
          </div>
        </h2>

        <div className="site-card-wrapper" style={{ maxWidth:900, margin: "auto", marginTop:32, paddingBottom:256 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card
                style={{ maxWidth: 200 }}
                cover={<img alt="nft" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/NFT_Icon.png/480px-NFT_Icon.png" />}
                bordered={false}
              >
              </Card>
            </Col>
            <Col span={6}>
              <Card
                style={{ maxWidth: 200 }}
                cover={<img alt="discord" src="https://cdn.icon-icons.com/icons2/2108/PNG/512/discord_icon_130958.png" />}
                bordered={false}
              >
              </Card>
            </Col>
            <Col span={6}>
              <Card
                style={{ maxWidth: 200 }}
                cover={<img alt="superfluid" src="https://trademarks.justia.com/media/og_image.php?serial=90473524" />}
                bordered={false}
              >
              </Card>
            </Col>
            <Col span={6}>
              <Card
                style={{ maxWidth: 200 }}
                cover={<img alt="MEMBERS" src="https://nevadavaping.org/wp-content/uploads/2019/03/Premium-Member-Icon-3-300x300.png" />}
                bordered={false}
              >
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
  return (
    <div>
      <h1 style={{ margin: 20 }}>
        <span style={{ marginRight: 8 }}>🛰</span>
        <b>Welcome</b> to
        <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          NiftyDiscord Members
        </span>
      </h1>

      <h2 style={{ width: 800, margin: "auto" }}>
        NiftyDiscordMember is a platform where one can tokenize roles, channels of one's Discord servers.
        Buyers can buy NFT and access the creator's private channels by starting superfluid stream using NFT.
      </h2>

      <LogInDiscord />
      <div className="site-card-wrapper" style={{ maxWidth:900, margin: "auto", marginTop:32, paddingBottom:256 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card
              style={{ maxWidth: 200 }}
              cover={<img alt="nft" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/NFT_Icon.png/480px-NFT_Icon.png" />}
              bordered={false}
            >
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{ maxWidth: 200 }}
              cover={<img alt="discord" src="https://cdn.icon-icons.com/icons2/2108/PNG/512/discord_icon_130958.png" />}
              bordered={false}
            >
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{ maxWidth: 200 }}
              cover={<img alt="superfluid" src="https://trademarks.justia.com/media/og_image.php?serial=90473524" />}
              bordered={false}
            >
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{ maxWidth: 200 }}
              cover={<img alt="MEMBERS" src="https://nevadavaping.org/wp-content/uploads/2019/03/Premium-Member-Icon-3-300x300.png" />}
              bordered={false}
            >
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
