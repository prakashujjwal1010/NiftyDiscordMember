import React, { useState } from "react";
import { Address, AddressInput, LogInDiscord } from "../components";
import { Select, Button } from "antd";

const { Option } = Select;

export default function Home({oauth, isValidSession, setExpiryTime}) {

  if(isValidSession()) {
    return(
      <div>
        <h1 style={{ margin: 32 }}>
          <span style={{ marginRight: 8 }}>🛰</span>
          <b>Welcome</b> to
          <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            NiftyDiscord Members
          </span>
        </h1>

        <h2 style={{ marginTop: 32 }}>
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
      </div>
    );
  }
  return (
    <div>

      <h1 style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🛰</span>
        <b>Welcome</b> to
        <span class="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          NiftyDiscord Members
        </span>
      </h1>

      <LogInDiscord />

    </div>
  );
}
