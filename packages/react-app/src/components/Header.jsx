import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="/" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏗 NiftyDiscord Members"
        subTitle="NFTs + Discord Subscription Based Membership"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
