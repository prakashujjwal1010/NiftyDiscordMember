import React, { useState } from "react";
import { formatEther } from "@ethersproject/units";
import { Address, AddressInput } from "../components";
import { Select, Button } from "antd";
const crypto = require("crypto");

const { Option } = Select;
const REACT_APP_DISCORD_AUTHORIZE_URI = 'https://discord.com/api/oauth2/authorize';

export default function LogInDiscord() {
  const {
    REACT_APP_DISCORD_CLIENT_ID,
  } = process.env;

  return (
    <div>
      <h2 style={{ marginTop: 20 }}>
        To use this app you have to sign in with your
        <span class="highlight" style={{ margin: 4, /*backgroundColor: "#f9f9f9",*/ padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          discord
        </span>
        account also!
        <div style={{ width: 350, padding: 16, margin: "auto" }}>
          <Button type="primary" shape="round" size="large" block onClick={async ()=>{
            const state = crypto.randomBytes(16).toString("hex");
            const url = `${REACT_APP_DISCORD_AUTHORIZE_URI}?response_type=token&client_id=${REACT_APP_DISCORD_CLIENT_ID}&state=${state}&scope=guilds%20identify`;
            //console.log(url);
            window.location = url;
          }}>
            LOGIN WITH DISCORD
          </Button>
        </div>
      </h2>

    </div>
  );
}
