import React, { useState, useEffect, useCallback } from 'react'
import { SWRConfig } from 'swr'

import { motion, AnimatePresence } from "framer-motion"

import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from 'react-router-dom'

import {
  MAINNET,
  TESTNET,
  ARBITRUM_TESTNET,
  ARBITRUM,
  DEFAULT_SLIPPAGE_AMOUNT,
  SLIPPAGE_BPS_KEY,
  IS_PNL_IN_LEVERAGE_KEY,
  BASIS_POINTS_DIVISOR,
  SHOULD_SHOW_POSITION_LINES_KEY,
  clearWalletConnectData,
  switchNetwork,
  helperToast,
  getChainName,
  useChainId,
  getAccountUrl,
  getInjectedHandler,
  useEagerConnect,
  useLocalStorageSerializeKey,
  useInactiveListener,
  shortenAddress,
  getExplorerUrl,
  getWalletConnectHandler
} from './Helpers'

import Home from './views/Home/Home'
import Presale from './views/Presale/Presale'
import Dashboard from './views/Dashboard/Dashboard'
import Stake from './views/Stake/Stake'
import Exchange from './views/Exchange/Exchange'
import Actions from './views/Actions/Actions'
import OrdersOverview from './views/OrdersOverview/OrdersOverview'
import PositionsOverview from './views/PositionsOverview/PositionsOverview'
import BuyGlp from './views/BuyGlp/BuyGlp'
import SellGlp from './views/SellGlp/SellGlp'
import Buy from './views/Buy/Buy'
import NftWallet from './views/NftWallet/NftWallet'
import BeginAccountTransfer from './views/BeginAccountTransfer/BeginAccountTransfer'
import CompleteAccountTransfer from './views/CompleteAccountTransfer/CompleteAccountTransfer'
import Debug from './views/Debug/Debug'

import cx from "classnames";
import { cssTransition, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import NetworkSelector from './components/NetworkSelector/NetworkSelector'
import Modal from './components/Modal/Modal'
import Checkbox from './components/Checkbox/Checkbox'

import { RiMenuLine } from 'react-icons/ri'
import { FaTimes } from 'react-icons/fa'
import { BsThreeDots } from 'react-icons/bs'
import { FiX } from "react-icons/fi"
import { BiLogOut }  from 'react-icons/bi'

import './Font.css'
import './Shared.css'
import './App.css';
import './Input.css';
import './AppOrder.css';

import logoImg from './img/logo_GMX.svg'
// import logoImg from './img/gmx-logo-final-white-small.png'
import metamaskImg from './img/metamask.png'
import walletConnectImg from './img/walletconnect-circle-blue.svg'

if ('ethereum' in window) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

function getLibrary(provider) {
  const library = new Web3Provider(provider)
  return library
}

const Zoom = cssTransition({
  enter: 'zoomIn',
  duration: 300
})

const onNetworkSelect = option => {
  switchNetwork(option.value)
}

function inPreviewMode() {
  return false
}

function AppHeaderLinks({ small, openSettings, clickCloseIcon }) {
  if (inPreviewMode()) {
    return (
      <div className="App-header-links preview">
        <div className="App-header-link-container App-header-link-home">
          <NavLink activeClassName="active" exact to="/">HOME</NavLink>
        </div>
        <div className="App-header-link-container">
          <NavLink activeClassName="active" to="/earn">EARN</NavLink>
        </div>
        <div className="App-header-link-container">
          <a href="https://gmxio.gitbook.io/gmx/" target="_blank" rel="noopener noreferrer">
            ABOUT
          </a>
        </div>
      </div>
    )
  }
  return (
    <div className="App-header-links">
      { small &&
        <div className="App-header-links-header">
          <div className="App-header-menu-icon-block" onClick={() => clickCloseIcon()}>
            <FiX className="App-header-menu-icon" />
          </div>
          <NavLink exact activeClassName="active" className="App-header-link-main" to="/">
            <img src={logoImg} alt="MetaMask" />
          </NavLink>
        </div>
      }
      <div className="App-header-link-container App-header-link-home">
        <NavLink activeClassName="active" exact to="/">Home</NavLink>
      </div>
      <div className="App-header-link-container">
        <NavLink activeClassName="active" to="/dashboard">Dashboard</NavLink>
      </div>
      <div className="App-header-link-container">
        <NavLink activeClassName="active" to="/earn">Earn</NavLink>
      </div>
      <div className="App-header-link-container">
        <NavLink activeClassName="active" to="/buy">Buy</NavLink>
      </div>
      <div className="App-header-link-container">
        <a href="https://gmxio.gitbook.io/gmx/" target="_blank" rel="noopener noreferrer">
          About
        </a>
      </div>
      <div className="App-header-link-container">
        <a href="https://www.gmx.house/p/leaderboard" target="_blank" rel="noopener noreferrer">
          Leaderboard
        </a>
      </div>
      {small &&
        <div className="App-header-link-container">
          {/* eslint-disable-next-line */}
          <a href="#" onClick={openSettings}>
            Settings
          </a>
        </div>
      }
      
    </div>
  )
}

function NetworkIcon({ chainId }) {
  let url
  if (chainId === MAINNET || chainId === TESTNET) {
    url = "/binance.svg"
  } else if (chainId === ARBITRUM_TESTNET || chainId === ARBITRUM) {
    url = "/arbitrum.svg"
  }
  return <img src={url} alt={getChainName(chainId)} className="Network-icon" />
}

function AppHeaderUser({
  openSettings,
  small,
  setActivatingConnector,
  walletModalVisible,
  setWalletModalVisible
}) {
  const { chainId } = useChainId()
  const { active, account } = useWeb3React()
  const showSelector = false
  const networkOptions = [
    { label: "Arbitrum", value: ARBITRUM },
    { label: "Binance Smart Chain (BSC)", value: MAINNET }
  ]

  useEffect(() => {
    if (active) {
      setWalletModalVisible(false)
    }
  }, [active, setWalletModalVisible])

  const icon = <NetworkIcon chainId={chainId} />
  const selectorLabel = <span>{icon}&nbsp;{getChainName(chainId)}</span>

  if (!active) {
    return (
      <div className="App-header-user">
        <div className="App-header-user-link">
          <NavLink activeClassName="active" className="default-btn" to="/trade">Trade</NavLink>
        </div>
        {showSelector && <NetworkSelector
          options={networkOptions}
          label={selectorLabel}
          onSelect={onNetworkSelect}
          className="App-header-user-netowork"
          showCaret={true}
          modalLabel="Switch Network"
          modalText="Or you can switch network manually in&nbsp;Metamask"
        />}
        <button target="_blank" rel="noopener noreferrer" className="default-btn header-connect-btn" onClick={() => setWalletModalVisible(true)}>
          Connect Wallet
        </button>
      </div>
    )
  }

  const accountUrl = getAccountUrl(chainId, account)

  return (
    <div className="App-header-user">
      <div className="App-header-user-link">
        <NavLink activeClassName="active" className="default-btn" to="/trade">Trade</NavLink>
      </div>
      {showSelector && <NetworkSelector
        options={networkOptions}
        label={selectorLabel}
        onSelect={onNetworkSelect}
        className="App-header-user-netowork"
        showCaret={true}
        modalLabel="Switch Network"
        modalText="Or you can switch network manually in&nbsp;Metamask"
      />}
      <a href={accountUrl} target="_blank" rel="noopener noreferrer" className="App-cta small transparent App-header-user-account">
        {shortenAddress(account, small ? 11 : 13)}
      </a>
      {!small &&
        <button className="App-header-user-settings" onClick={openSettings}>
          <BsThreeDots />
        </button>
      }
    </div>
  )
}

function FullApp() {
  const { connector, library, deactivate, activate } = useWeb3React()

  const { chainId } = useChainId()
  const [activatingConnector, setActivatingConnector] = useState()
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector, chainId])
  const triedEager = useEagerConnect(setActivatingConnector)
  useInactiveListener(!triedEager || !!activatingConnector)

  const disconnectAccount = useCallback(() => {
    // only works with WalletConnect
    clearWalletConnectData()
    deactivate()
  }, [deactivate])

  const disconnectAccountAndCloseSettings = () => {
    disconnectAccount()
    setIsSettingsVisible(false)
  }

  const connectInjectedWallet = getInjectedHandler(activate)
  const activateWalletConnect = getWalletConnectHandler(activate, deactivate, setActivatingConnector)

  const [walletModalVisible, setWalletModalVisible] = useState()
  const connectWallet = () => setWalletModalVisible(true)

  const [isDrawerVisible, setIsDrawerVisible] = useState(undefined)
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
  const slideVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 }
  }

  const [isSettingsVisible, setIsSettingsVisible] = useState(false)
  const [savedSlippageAmount, setSavedSlippageAmount] = useLocalStorageSerializeKey(
    [chainId, SLIPPAGE_BPS_KEY],
    DEFAULT_SLIPPAGE_AMOUNT
  )
  const [slippageAmount, setSlippageAmount] = useState(0)
  const [isPnlInLeverage, setIsPnlInLeverage] = useState(false)

  const [savedIsPnlInLeverage, setSavedIsPnlInLeverage] = useLocalStorageSerializeKey(
    [chainId, IS_PNL_IN_LEVERAGE_KEY],
    false
  )

  const [savedShouldShowPositionLines, setSavedShouldShowPositionLines] = useLocalStorageSerializeKey(
    [chainId, SHOULD_SHOW_POSITION_LINES_KEY],
    false
  )

  const openSettings = () => {
    const slippage = parseInt(savedSlippageAmount)
    setSlippageAmount(slippage / BASIS_POINTS_DIVISOR * 100)
    setIsPnlInLeverage(savedIsPnlInLeverage)
    setIsSettingsVisible(true)
  }

  const saveAndCloseSettings = () => {
    const slippage = parseFloat(slippageAmount)
    if (isNaN(slippage)) {
      helperToast.error("Invalid slippage value")
      return
    }
    if (slippage > 5) {
      helperToast.error("Slippage should be less than 5%")
      return
    }

    const basisPoints = slippage * BASIS_POINTS_DIVISOR / 100
    if (parseInt(basisPoints) !== parseFloat(basisPoints)) {
      helperToast.error("Max slippage precision is 0.01%")
      return
    }

    setSavedIsPnlInLeverage(isPnlInLeverage)
    setSavedSlippageAmount(basisPoints)
    setIsSettingsVisible(false)
  }

  const [pendingTxns, setPendingTxns] = useState([])

  useEffect(() => {
    const checkPendingTxns = async () => {
      const updatedPendingTxns = []
      for (let i = 0; i < pendingTxns.length; i++) {
        const pendingTxn = pendingTxns[i]
        const receipt = await library.getTransactionReceipt(pendingTxn.hash)
        if (receipt) {
          if (receipt.status === 0) {
            const txUrl = getExplorerUrl(chainId) + "tx/" + pendingTxn.hash
            helperToast.error(
              <div>
                Txn failed. <a href={txUrl} target="_blank" rel="noopener noreferrer">View</a>
                <br />
              </div>
            )
          }
          if (receipt.status === 1 && pendingTxn.message) {
            const txUrl = getExplorerUrl(chainId) + "tx/" + pendingTxn.hash
            helperToast.success(
              <div>
                {pendingTxn.message}. <a href={txUrl} target="_blank" rel="noopener noreferrer">View</a>
                <br />
              </div>
            )
          }
          continue
        }
        updatedPendingTxns.push(pendingTxn)
      }

      if (updatedPendingTxns.length !== pendingTxns.length) {
        setPendingTxns(updatedPendingTxns)
      }
    }

    const interval = setInterval(() => {
      checkPendingTxns()
    }, 2 * 1000)
    return () => clearInterval(interval);
  }, [library, pendingTxns, chainId])

  return (
    <Router>
      <div className="App">
        {/* <div className="App-background-side-1"></div>
        <div className="App-background-side-2"></div>
        <div className="App-background"></div>
        <div className="App-background-ball-1"></div>
        <div className="App-background-ball-2"></div>
        <div className="App-highlight"></div> */}
        <div className="App-content">
          {isDrawerVisible &&
            <AnimatePresence>
              {isDrawerVisible &&
                <motion.div className="App-header-backdrop"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeVariants}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsDrawerVisible(!isDrawerVisible)}
                >
                </motion.div>}
            </AnimatePresence>
          }
          <header>
            <div className="App-header large">
              <div className="App-header-container-left">
                <NavLink exact activeClassName="active" className="App-header-link-main" to="/">
                  <img src={logoImg} alt="MetaMask" />
                </NavLink>
                <AppHeaderLinks />
              </div>
              <div className="App-header-container-right">
                <AppHeaderUser
                  openSettings={openSettings}
                  setActivatingConnector={setActivatingConnector}
                  walletModalVisible={walletModalVisible}
                  setWalletModalVisible={setWalletModalVisible}
                />
              </div>
            </div>
            <div className={cx("App-header", "small", { active: isDrawerVisible })}>
              <div className={cx("App-header-link-container", "App-header-top", { active: isDrawerVisible })}>
                <div className="App-header-container-left">
                  <div className="App-header-menu-icon-block" onClick={() => setIsDrawerVisible(!isDrawerVisible)}>
                    {!isDrawerVisible && <RiMenuLine className="App-header-menu-icon" />}
                    {isDrawerVisible && <FaTimes className="App-header-menu-icon" />}
                  </div>
                  <NavLink exact activeClassName="active" className="App-header-link-main" to="/">
                    <img src={logoImg} alt="MetaMask" />
                  </NavLink>
                </div>
                <div className="App-header-container-right">
                  <AppHeaderUser
                    openSettings={openSettings}
                    small
                    setActivatingConnector={setActivatingConnector}
                    walletModalVisible={walletModalVisible}
                    setWalletModalVisible={setWalletModalVisible}
                  />
                </div>
              </div>
            </div>
          </header>
          <AnimatePresence>
            {isDrawerVisible &&
              <motion.div
                onClick={() => setIsDrawerVisible(false)}
                className="App-header-links-container App-header-drawer"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={slideVariants}
                transition={{ duration: 0.2 }}
              >
                <AppHeaderLinks small openSettings={openSettings} clickCloseIcon={() => setIsDrawerVisible(false)} />
              </motion.div>}
          </AnimatePresence>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/trade">
              <Exchange
                savedIsPnlInLeverage={savedIsPnlInLeverage}
                setSavedIsPnlInLeverage={setSavedIsPnlInLeverage}
                savedSlippageAmount={savedSlippageAmount}
                setPendingTxns={setPendingTxns}
                pendingTxns={pendingTxns}
                savedShouldShowPositionLines={savedShouldShowPositionLines}
                setSavedShouldShowPositionLines={setSavedShouldShowPositionLines}
                connectWallet={connectWallet}
              />
            </Route>
            <Route exact path="/presale">
              <Presale />
            </Route>
            <Route exact path="/dashboard">
              <Dashboard />
            </Route>
            <Route exact path="/earn">
              <Stake setPendingTxns={setPendingTxns} connectWallet={connectWallet} />
            </Route>
            <Route exact path="/buy">
              <Buy />
            </Route>
            <Route exact path="/buy_glp">
              <BuyGlp
                savedSlippageAmount={savedSlippageAmount}
                setPendingTxns={setPendingTxns}
                connectWallet={connectWallet}
              />
            </Route>
            <Route exact path="/sell_glp">
              <SellGlp
                savedSlippageAmount={savedSlippageAmount}
                setPendingTxns={setPendingTxns}
                connectWallet={connectWallet}
              />
            </Route>
            <Route exact path="/about">
              <Home />
            </Route>
            <Route exact path="/nft_wallet">
              <NftWallet />
            </Route>
            <Route exact path="/actions/:account">
              <Actions />
            </Route>
            <Route exact path="/orders_overview">
              <OrdersOverview />
            </Route>
            <Route exact path="/positions_overview">
              <PositionsOverview />
            </Route>
            <Route exact path="/actions">
              <Actions />
            </Route>
            <Route exact path="/begin_account_transfer">
              <BeginAccountTransfer
                setPendingTxns={setPendingTxns}
              />
            </Route>
            <Route exact path="/complete_account_transfer/:sender/:receiver">
              <CompleteAccountTransfer
                setPendingTxns={setPendingTxns}
              />
            </Route>
            <Route exact path="/debug">
              <Debug />
            </Route>
          </Switch>
        </div>
      </div>
      <ToastContainer
        limit={1}
        transition={Zoom}
        position="bottom-right"
        autoClose={7000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={false}
        draggable={false}
        pauseOnHover
      />
      <Modal className="Connect-wallet-modal" isVisible={walletModalVisible} setIsVisible={setWalletModalVisible} label="Connect Wallet">
        <button className="MetaMask-btn" onClick={connectInjectedWallet}>
          <img src={metamaskImg} alt="MetaMask"/>
          <div>MetaMask</div>
        </button>
        <button className="WalletConnect-btn" onClick={activateWalletConnect}>
          <img src={walletConnectImg} alt="WalletConnect"/>
          <div>WalletConnect</div>
        </button>
      </Modal>
      <Modal className="App-settings" isVisible={isSettingsVisible} setIsVisible={setIsSettingsVisible} label="Settings">
        <div className="App-settings-row">
          <div>
            Slippage Tolerance
          </div>
          <div className="App-slippage-tolerance-input-container">
            <input type="number" className="App-slippage-tolerance-input" min="0" value={slippageAmount} onChange={(e) => setSlippageAmount(e.target.value)} />
            <div className="App-slippage-tolerance-input-percent">%</div>
          </div>
        </div>
        <div className="Exchange-settings-row">
          <Checkbox isChecked={isPnlInLeverage} setIsChecked={setIsPnlInLeverage}>
            Include PnL in leverage display
          </Checkbox>
        </div>
        <div className="Exchange-settings-row">
          <button className="btn-link" onClick={disconnectAccountAndCloseSettings}>
            <BiLogOut className="logout-icon" />
            Logout from Account
          </button>
        </div>
        <button className="App-cta Exchange-swap-button" onClick={saveAndCloseSettings}>Save</button>
      </Modal>
    </Router>
  )
}

function PreviewApp() {
  const [isDrawerVisible, setIsDrawerVisible] = useState(undefined)
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
  const slideVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 }
  }

  return (
    <Router>
      <div className="App">
        <div className="App-background-side-1"></div>
        <div className="App-background-side-2"></div>
        <div className="App-background"></div>
        <div className="App-background-ball-1"></div>
        <div className="App-background-ball-2"></div>
        <div className="App-highlight"></div>
        <div className="App-content">
          {isDrawerVisible &&
            <AnimatePresence>
              {isDrawerVisible &&
                <motion.div className="App-header-backdrop"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeVariants}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsDrawerVisible(!isDrawerVisible)}
                >
                </motion.div>}
            </AnimatePresence>
          }
          <header>
            <div className="App-header large preview">
              <div className="App-header-container-left">
                <NavLink exact activeClassName="active" className="App-header-link-main" to="/">
                  <img src={logoImg} alt="MetaMask" />
                  GMX
                </NavLink>
              </div>
              <div className="App-header-container-right">
                <AppHeaderLinks />
              </div>
            </div>
            <div className={cx("App-header", "small", { active: isDrawerVisible })}>
              <div className={cx("App-header-link-container", "App-header-top", { active: isDrawerVisible })}>
                <div className="App-header-container-left">
                  <div className="App-header-link-main">
                    <img src={logoImg} alt="MetaMask" />
                  </div>
                </div>
                <div className="App-header-container-right">
                  <div onClick={() => setIsDrawerVisible(!isDrawerVisible)}>
                    {!isDrawerVisible && <RiMenuLine className="App-header-menu-icon" />}
                    {isDrawerVisible && <FaTimes className="App-header-menu-icon" />}
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {isDrawerVisible &&
                  <motion.div
                    onClick={() => setIsDrawerVisible(false)}
                    className="App-header-links-container App-header-drawer"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={slideVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <AppHeaderLinks small />
                  </motion.div>}
              </AnimatePresence>
            </div>
          </header>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/earn">
              <Stake />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  )
}

function App() {
  if (inPreviewMode()) {
    return (
      <Web3ReactProvider getLibrary={getLibrary}>
        <PreviewApp />
      </Web3ReactProvider>
    )
  }

  return (
    <SWRConfig value={{ refreshInterval: 5000 }}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <FullApp />
      </Web3ReactProvider>
    </SWRConfig>
  )
}

export default App;
