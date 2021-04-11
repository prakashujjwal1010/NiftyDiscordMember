pragma solidity ^0.7.0;
//SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SuperAppPayment.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract YourCollectible is ERC721, Ownable, SuperAppPayment {

  using Counters for Counters.Counter;
  using EnumerableMap for EnumerableMap.UintToAddressMap;
  using EnumerableSet for EnumerableSet.UintSet;

  Counters.Counter private _tokenIds;
  mapping(string => uint8) hashes;
  mapping(uint256 => uint256) private _tokenStatus;
  mapping(uint256 => uint256) private _tokenCreatorGuildID;
  mapping(uint256 => uint256) private _tokenOwnerDiscordID;
  EnumerableMap.UintToAddressMap private _tokenCreator;
  mapping(address => EnumerableSet.UintSet) private _tokensCreated;
  mapping(address => uint256) private _noOfTokensCreated;


  event AccessActivated(uint256 tokenId, uint256 discordID);
  event AccessDeactivated(uint256 tokenId, uint256 discordID);


  constructor(
    ISuperfluid host,
    IConstantFlowAgreementV1 cfa,
    ISuperToken acceptedToken
  ) ERC721("MembershipNFT", "Member") SuperAppPayment(host, cfa, acceptedToken) {
      _setBaseURI("https://ipfs.io/ipfs/");
  }

  function tokenOfCreatorByIndex(address addr, uint256 index) public view returns (uint256) {
    return _tokensCreated[addr].at(index);
  }

  function getNoOfTokensCreated(address addr) public view returns (uint256) {
    return _noOfTokensCreated[addr];
  }

  function getTokenStatus(uint256 tokenId) public view returns (uint256) {
    require(_exists(tokenId));
    return _tokenStatus[tokenId];
  }

  function getTokenCreatorGuildID(uint256 tokenId) public view returns (uint256) {
    require(_exists(tokenId));
    return _tokenCreatorGuildID[tokenId];
  }

  function getTokenOwnerDiscordID(uint256 tokenId) public view returns (uint256) {
    require(_exists(tokenId));
    return _tokenOwnerDiscordID[tokenId];
  }

  function getTokenCreator(uint256 tokenId) public view returns (address) {
    require(_exists(tokenId));
    return _tokenCreator.get(tokenId);
  }

  function mintItem(address to, string memory tokenURI, uint256 guildID)
      public
      returns (uint256)
  {
      _tokenIds.increment();

      uint256 id = _tokenIds.current();
      _tokenStatus[id] = 0;
      _tokenCreator.set(id, msg.sender);
      _tokensCreated[msg.sender].add(id);
      _noOfTokensCreated[msg.sender]+=1;
      _tokenCreatorGuildID[id] = guildID;
      _mint(to, id);
      _setTokenURI(id, tokenURI);

      return id;
  }

  function updateNFT(bytes calldata ctx, uint256 tokenId, uint256 discordID)
      private
      returns (bytes memory newCtx)
  {
      address requester = host.decodeCtx(ctx).msgSender;

      newCtx = ctx;
      int96 netFlowRate = cfa.getNetFlow(acceptedToken, address(this));
      if (netFlowRate > 0) {
        //if the requester is the owner of the token of tokenId
          if (_exists(tokenId) && ownerOf(tokenId) == requester) {
            _tokenOwnerDiscordID[tokenId] = discordID;
            //current rate from contract to token creator
            (, int96 currentRateToCreator, , ) =
                cfa.getFlow(acceptedToken, address(this), _tokenCreator.get(tokenId));

            if (currentRateToCreator == 0) {
                (newCtx, ) = host.callAgreementWithContext(
                    cfa,
                    abi.encodeWithSelector(
                        cfa.createFlow.selector,
                        acceptedToken,
                        _tokenCreator.get(tokenId),
                        netFlowRate,
                        new bytes(0)
                    ),
                    new bytes(0),
                    newCtx
                );
            } else {
                (newCtx, ) = host.callAgreementWithContext(
                    cfa,
                    abi.encodeWithSelector(
                        cfa.updateFlow.selector,
                        acceptedToken,
                        _tokenCreator.get(tokenId),
                        currentRateToCreator + netFlowRate,
                        new bytes(0)
                    ),
                    new bytes(0),
                    newCtx
                );
            }

            _tokenStatus[tokenId] = 1;
            emit AccessActivated(tokenId, discordID);
          }
      } else if (netFlowRate < 0) {
        //if the requester is the owner of the token of tokenId
        if (_exists(tokenId) && ownerOf(tokenId) == requester) {
          _tokenOwnerDiscordID[tokenId] = discordID;
            //current rate from contract to token creator
            (, int96 currentRate, , ) =
                cfa.getFlow(acceptedToken, address(this), _tokenCreator.get(tokenId));
            int96 newRate = currentRate + netFlowRate;
            if (newRate == 0) {
                (newCtx, ) = host.callAgreementWithContext(
                    cfa,
                    abi.encodeWithSelector(
                        cfa.deleteFlow.selector,
                        acceptedToken,
                        address(this),
                        _tokenCreator.get(tokenId),
                        new bytes(0)
                    ),
                    new bytes(0),
                    newCtx
                );
            } else {
                (newCtx, ) = host.callAgreementWithContext(
                    cfa,
                    abi.encodeWithSelector(
                        cfa.updateFlow.selector,
                        acceptedToken,
                        _tokenCreator.get(tokenId),
                        newRate,
                        new bytes(0)
                    ),
                    new bytes(0),
                    newCtx
                );
            }
            _tokenStatus[tokenId] = 2;
            emit AccessDeactivated(tokenId, discordID);
          }
      }
      return newCtx;
  }

  function _beforeTokenTransfer(
      address from,
      address to,
      uint256 tokenId
  ) internal override {

      if (to == from) return ;
      if (_tokenStatus[tokenId] == 1) {
        //delete flow to contract
        (,int96 outFlowRate,,) = cfa.getFlow(acceptedToken, ownerOf(tokenId), address(this));
        if(outFlowRate > 0){
          host.callAgreement(
              cfa,
              abi.encodeWithSelector(
                  cfa.deleteFlow.selector,
                  acceptedToken,
                  ownerOf(tokenId),
                  address(this),
                  new bytes(0)
              ),
              "0x"
          );
        }
        _tokenStatus[tokenId] = 2;
        emit AccessDeactivated(tokenId, _tokenOwnerDiscordID[tokenId]);
      }
  }

  function afterAgreementCreated(
      ISuperToken _superToken,
      address _agreementClass,
      bytes32, // _agreementId
      bytes calldata, // _agreementData
      bytes calldata, // _cbdata
      bytes calldata _ctx
  )
      external
      override
      onlyExpected(_superToken, _agreementClass)
      onlyHost
      returns (bytes memory)
  {   uint256 tokenId;
      uint256 discordID;
      (tokenId, discordID) = abi.decode(host.decodeCtx(_ctx).userData, (uint256, uint256));
      return updateNFT(_ctx, tokenId, discordID);
  }

  function afterAgreementUpdated(
      ISuperToken _superToken,
      address _agreementClass,
      bytes32, // _agreementId
      bytes calldata, // _agreementData
      bytes calldata, // _cbdata
      bytes calldata _ctx
  )
      external
      override
      onlyExpected(_superToken, _agreementClass)
      onlyHost
      returns (bytes memory)
  {   uint256 tokenId;
      uint256 discordID;
      (tokenId, discordID) = abi.decode(host.decodeCtx(_ctx).userData, (uint256, uint256));
      return updateNFT(_ctx, tokenId, discordID);
  }

  function afterAgreementTerminated(
      ISuperToken _superToken,
      address _agreementClass,
      bytes32, // _agreementId
      bytes calldata, // _agreementData
      bytes calldata, // _cbdata
      bytes calldata _ctx
  )
      external
      override
      onlyExpected(_superToken, _agreementClass)
      onlyHost
      returns (bytes memory)
  {   uint256 tokenId;
      uint256 discordID;
      (tokenId, discordID) = abi.decode(host.decodeCtx(_ctx).userData, (uint256, uint256));
      bytes memory newCtx = updateNFT(_ctx, tokenId, discordID);
      return newCtx;
  }
}
