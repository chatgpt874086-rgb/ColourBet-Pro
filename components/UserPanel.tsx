import React, { useContext, useState, useRef } from 'react';
import { GameContext } from '../App';
import { formatCurrency, getResultColorClass, maskMobile } from '../utils';
import { Home, Gamepad2, Wallet, Users, User, Trophy, TrendingUp, Clock, AlertCircle, Copy, History, Settings, ChevronRight, Camera, Edit2, X, Upload } from 'lucide-react';
import { BetChoice, GameMode } from '../types';

type Page = 'HOME' | 'GAME' | 'WALLET' | 'REFER' | 'BETS' | 'PROFILE';

export const UserPanel: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('HOME');
  const context = useContext(GameContext);

  if (!context) return null;

  const NavItem = ({ page, icon: Icon, label }: { page: Page, icon: any, label: string }) => (
    <button 
      onClick={() => setActivePage(page)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${activePage === page ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
    >
      <Icon size={20} className={activePage === page ? 'mb-1 scale-110 transition-transform' : 'mb-1'} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <>
      <div className="pb-10">
        {activePage === 'HOME' && <UserHome setPage={setActivePage} />}
        {activePage === 'GAME' && <UserGame />}
        {activePage === 'WALLET' && <UserWallet />}
        {activePage === 'REFER' && <UserRefer />}
        {activePage === 'BETS' && <UserBets />}
        {activePage === 'PROFILE' && <UserProfile />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-lg border-t border-slate-700 flex justify-around items-center px-2 py-1 z-40 md:max-w-md md:mx-auto md:rounded-t-xl md:mb-4">
        <NavItem page="HOME" icon={Home} label="Home" />
        <NavItem page="GAME" icon={Gamepad2} label="Game" />
        <NavItem page="WALLET" icon={Wallet} label="Wallet" />
        <NavItem page="REFER" icon={Users} label="Refer" />
        <NavItem page="PROFILE" icon={User} label="Profile" />
      </div>
    </>
  );
};

// --- Sub Components ---

const UserHome = ({ setPage }: { setPage: (p: Page) => void }) => {
  const { currentUser, games } = useContext(GameContext)!;
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-indigo-100 text-sm font-medium">Total Balance</p>
                <h2 className="text-3xl font-bold mt-1">{formatCurrency(currentUser!.balance)}</h2>
                <p className="text-xs text-indigo-200 mt-1 font-mono">UID: {currentUser!.uid}</p>
            </div>
            {currentUser?.avatar && (
                <img src={currentUser.avatar} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white/20 object-cover" />
            )}
        </div>
        <div className="relative z-10 flex gap-3 mt-4">
            <button onClick={() => setPage('WALLET')} className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors">Withdraw</button>
            <button onClick={() => setPage('WALLET')} className="bg-indigo-700/50 text-white border border-indigo-400/30 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">Deposit</button>
        </div>
      </div>

      <div>
         <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg text-white">Live Results (Fast)</h3>
             <button onClick={() => setPage('GAME')} className="text-xs text-indigo-400 hover:text-indigo-300">Play Now</button>
         </div>
         <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
             {games['FAST'].history.slice(0, 10).map((game) => (
                 <div key={game.periodId} className="flex-shrink-0 flex flex-col items-center space-y-2">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${getResultColorClass(game.resultColor)}`}>
                         {game.resultNumber}
                     </div>
                     <span className="text-[10px] text-slate-400">{game.periodId.slice(-4)}</span>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
};

const UserGame = () => {
    const { games, gameActions, bets, currentUser } = useContext(GameContext)!;
    const [mode, setMode] = useState<GameMode>('FAST');
    const [amount, setAmount] = useState(10);
    const [selectedBet, setSelectedBet] = useState<{type: 'COLOR'|'NUMBER'|'SIZE', choice: BetChoice} | null>(null);

    const gameState = games[mode];
    const timeLeft = gameState.timeLeft;
    const history = gameState.history;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleBet = () => {
        if (!selectedBet) return;
        gameActions.placeBet(mode, amount, selectedBet.choice, selectedBet.type);
        setSelectedBet(null);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Mode Selector */}
            <div className="flex bg-slate-800 p-1 rounded-xl">
                <button onClick={() => setMode('FAST')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'FAST' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-slate-400'}`}>Parity (30s)</button>
                <button onClick={() => setMode('STD')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'STD' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400'}`}>Sapre (1m)</button>
                <button onClick={() => setMode('PRO')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'PRO' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'text-slate-400'}`}>Beacon (3m)</button>
            </div>

            {/* Timer Card */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex justify-between items-center shadow-lg relative overflow-hidden">
                <div className={`absolute top-0 left-0 h-1 transition-all duration-1000 ${timeLeft < 10 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{width: `${(timeLeft / (mode === 'FAST' ? 30 : mode === 'STD' ? 60 : 180)) * 100}%`}}></div>
                <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Period: {mode}</p>
                    <p className="text-xl font-mono font-bold text-white">{gameState.currentPeriodId}</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Time Left</p>
                    <div className="flex items-center space-x-2">
                        <Clock size={16} className={timeLeft < 6 ? 'text-red-500 animate-pulse' : 'text-indigo-400'} />
                        <p className={`text-2xl font-mono font-bold ${timeLeft < 6 ? 'text-red-500' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Betting Controls */}
            {timeLeft > 5 ? (
                <div className="space-y-6 animate-fade-in">
                    {/* Big/Small Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setSelectedBet({type: 'SIZE', choice: 'big'})}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 py-3 rounded-lg font-bold text-white shadow-lg shadow-orange-900/50 transition-transform active:scale-95 uppercase tracking-wide"
                        >
                            Big (5-9)
                        </button>
                        <button 
                            onClick={() => setSelectedBet({type: 'SIZE', choice: 'small'})}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 py-3 rounded-lg font-bold text-white shadow-lg shadow-blue-900/50 transition-transform active:scale-95 uppercase tracking-wide"
                        >
                            Small (0-4)
                        </button>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-3 gap-3">
                        <button 
                            onClick={() => setSelectedBet({type: 'COLOR', choice: 'green'})}
                            className="bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold text-white shadow-lg shadow-emerald-900/50 transition-transform active:scale-95"
                        >
                            Green
                        </button>
                        <button 
                            onClick={() => setSelectedBet({type: 'COLOR', choice: 'violet'})}
                            className="bg-violet-600 hover:bg-violet-500 py-3 rounded-lg font-bold text-white shadow-lg shadow-violet-900/50 transition-transform active:scale-95"
                        >
                            Violet
                        </button>
                        <button 
                            onClick={() => setSelectedBet({type: 'COLOR', choice: 'red'})}
                            className="bg-rose-600 hover:bg-rose-500 py-3 rounded-lg font-bold text-white shadow-lg shadow-rose-900/50 transition-transform active:scale-95"
                        >
                            Red
                        </button>
                    </div>

                    {/* Numbers */}
                    <div className="grid grid-cols-5 gap-2 bg-slate-800 p-3 rounded-xl border border-slate-700">
                        {[0,1,2,3,4,5,6,7,8,9].map(num => (
                            <button 
                                key={num}
                                onClick={() => setSelectedBet({type: 'NUMBER', choice: num})}
                                className="aspect-square rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold border border-slate-600 flex items-center justify-center transition-colors relative overflow-hidden"
                            >
                                {num}
                                {num === 0 && <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-violet-500/20"></div>}
                                {num === 5 && <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-violet-500/20"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-slate-800/50 rounded-xl p-8 flex flex-col items-center justify-center border border-slate-700/50 text-center animate-pulse">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold text-white">Locked</h3>
                    <p className="text-slate-400 text-sm">Calculating Result...</p>
                </div>
            )}

            {/* Bet Modal */}
            {selectedBet && (
                <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-slate-800 w-full max-w-md rounded-2xl p-6 border border-slate-700 relative">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Bet on <span className="capitalize text-indigo-400">{selectedBet.choice}</span>
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Amount</label>
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {[10, 100, 1000, 10000].map(val => (
                                        <button 
                                            key={val}
                                            onClick={() => setAmount(val)}
                                            className={`py-2 rounded border text-sm font-bold ${amount === val ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
                                    <button onClick={() => setAmount(Math.max(10, amount - 10))} className="w-8 h-8 rounded bg-slate-700 text-white flex items-center justify-center font-bold">-</button>
                                    <input 
                                        type="number" 
                                        value={amount} 
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        className="flex-1 bg-transparent text-center text-white font-bold outline-none" 
                                    />
                                    <button onClick={() => setAmount(amount + 10)} className="w-8 h-8 rounded bg-slate-700 text-white flex items-center justify-center font-bold">+</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setSelectedBet(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-700 transition-colors">Cancel</button>
                            <button onClick={handleBet} className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/50 transition-colors">Confirm Bet</button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Table */}
            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <div className="bg-slate-700/50 px-4 py-3 border-b border-slate-700">
                    <h3 className="font-bold text-white flex items-center">
                        <History size={16} className="mr-2 text-indigo-400"/> {mode} History
                    </h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="text-slate-400 bg-slate-800 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left">Period</th>
                                <th className="px-4 py-2 text-center">Number</th>
                                <th className="px-4 py-2 text-center">Size</th>
                                <th className="px-4 py-2 text-right">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {history.map(game => (
                                <tr key={game.periodId}>
                                    <td className="px-4 py-2 text-slate-300">{game.periodId}</td>
                                    <td className="px-4 py-2 text-center font-bold text-indigo-300">{game.resultNumber}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${game.resultSize === 'big' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {game.resultSize}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 flex justify-end">
                                        <div className={`w-3 h-3 rounded-full ${getResultColorClass(game.resultColor)}`}></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
             {/* My Bets for this mode */}
             <div className="mt-4">
                <h3 className="font-bold text-white mb-2">My {mode} Bets</h3>
                {bets.filter(b => b.userId === currentUser!.id && b.gameMode === mode).slice(0, 5).map(bet => (
                    <div key={bet.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700 mb-2 flex justify-between items-center text-sm">
                        <div>
                             <span className="text-xs text-slate-500">{bet.periodId}</span>
                             <p className="font-bold text-white capitalize">{bet.choice}</p>
                        </div>
                        <div className="text-right">
                            <span className={`block font-bold ${bet.status === 'WIN' ? 'text-emerald-400' : bet.status === 'LOSS' ? 'text-red-400' : 'text-yellow-400'}`}>{bet.status}</span>
                            <span className="text-xs text-slate-400">{formatCurrency(bet.amount)}</span>
                        </div>
                    </div>
                ))}
             </div>
        </div>
    );
};

const UserWallet = () => {
    const { currentUser, transactions, userActions } = useContext(GameContext)!;
    const [tab, setTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
    
    // Deposit State
    const [depositAmount, setDepositAmount] = useState('');
    const [utr, setUtr] = useState('');

    // Withdraw State
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState<'UPI'|'BANK'>('UPI');
    const [upiId, setUpiId] = useState('');
    const [bankDetails, setBankDetails] = useState({ acctNo: '', ifsc: '', holder: '' });

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!depositAmount || !utr) return;
        userActions.requestDeposit(Number(depositAmount), utr);
        setDepositAmount('');
        setUtr('');
        alert("Deposit request submitted! Admin will verify UTR.");
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        if(!withdrawAmount) return;
        const details = withdrawMethod === 'UPI' ? { upiId } : bankDetails;
        userActions.requestWithdraw(Number(withdrawAmount), withdrawMethod, details);
        setWithdrawAmount('');
        alert("Withdrawal request submitted!");
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 text-center">
                <p className="text-slate-400 text-sm">Available Balance</p>
                <h2 className="text-4xl font-bold text-white mt-2">{formatCurrency(currentUser!.balance)}</h2>
            </div>

            <div className="bg-slate-800 rounded-xl p-1 flex">
                <button onClick={() => setTab('DEPOSIT')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${tab === 'DEPOSIT' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>Deposit</button>
                <button onClick={() => setTab('WITHDRAW')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${tab === 'WITHDRAW' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>Withdraw</button>
            </div>

            {tab === 'DEPOSIT' ? (
                <form onSubmit={handleDeposit} className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-fade-in">
                    <h3 className="text-white font-bold mb-4">Add Money</h3>
                    
                    {/* Fake UPI QR Area */}
                    <div className="bg-white p-4 rounded-lg mb-4 flex flex-col items-center">
                        <div className="w-32 h-32 bg-slate-200 mb-2 flex items-center justify-center text-slate-400 text-xs text-center">QR Code<br/>(Demo)</div>
                        <p className="text-slate-900 font-mono text-sm font-bold">pay@colorbet.demo</p>
                        <p className="text-xs text-slate-500 mt-1">Scan or copy UPI ID to pay</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">Amount</label>
                            <input 
                                type="number" 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white font-bold focus:border-indigo-500 focus:outline-none"
                                placeholder="Min 100"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">UTR Number (Payment Proof)</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white font-bold focus:border-indigo-500 focus:outline-none"
                                placeholder="12 Digit UTR / Ref No."
                                value={utr}
                                onChange={(e) => setUtr(e.target.value)}
                                required
                                minLength={12}
                            />
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-emerald-900/50">
                            Submit Request
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleWithdraw} className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-fade-in">
                    <h3 className="text-white font-bold mb-4">Withdraw Money</h3>
                    
                    <div className="space-y-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">Amount</label>
                            <input 
                                type="number" 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white font-bold focus:border-indigo-500 focus:outline-none"
                                placeholder="0.00"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">Method</label>
                            <select 
                                value={withdrawMethod} 
                                onChange={(e) => setWithdrawMethod(e.target.value as any)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white font-bold focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="UPI">UPI Transfer</option>
                                <option value="BANK">Bank Transfer</option>
                            </select>
                        </div>

                        {withdrawMethod === 'UPI' ? (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2">UPI ID</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white font-bold focus:border-indigo-500 focus:outline-none"
                                    placeholder="user@upi"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    required
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    placeholder="Account Holder Name"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none"
                                    value={bankDetails.holder}
                                    onChange={(e) => setBankDetails({...bankDetails, holder: e.target.value})}
                                    required
                                />
                                <input 
                                    type="text" 
                                    placeholder="Account Number"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none"
                                    value={bankDetails.acctNo}
                                    onChange={(e) => setBankDetails({...bankDetails, acctNo: e.target.value})}
                                    required
                                />
                                <input 
                                    type="text" 
                                    placeholder="IFSC Code"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none"
                                    value={bankDetails.ifsc}
                                    onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value})}
                                    required
                                />
                            </div>
                        )}

                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-900/50">
                            Request Withdrawal
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                <h3 className="text-slate-400 text-sm font-bold uppercase">Transaction History</h3>
                {transactions.filter(t => t.userId === currentUser!.id).map(t => (
                    <div key={t.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'DEPOSIT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {t.type === 'DEPOSIT' ? <TrendingUp size={20} /> : <Wallet size={20} />}
                            </div>
                            <div>
                                <p className="text-white font-bold capitalize">{t.type.toLowerCase()}</p>
                                <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                                {t.type === 'DEPOSIT' && <p className="text-[10px] text-slate-500 font-mono">UTR: {t.utr}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${t.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-white'}`}>
                                {t.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(t.amount)}
                            </p>
                            <span className={`text-[10px] px-2 py-0.5 rounded ${
                                t.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                                t.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                                'bg-yellow-500/10 text-yellow-400'
                            }`}>
                                {t.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UserRefer = () => {
    const { currentUser } = useContext(GameContext)!;
    return (
        <div className="space-y-6">
             <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl p-8 text-center text-white shadow-lg">
                <Trophy size={48} className="mx-auto mb-4 text-yellow-300" />
                <h2 className="text-2xl font-bold mb-2">Refer & Earn</h2>
                <p className="text-white/80 text-sm mb-6">Invite friends and earn up to 40% commission on their bets forever!</p>
                
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 flex items-center justify-between">
                    <div className="text-left">
                        <p className="text-xs text-white/70">Your Promo Code</p>
                        <p className="text-xl font-mono font-bold">{currentUser?.promoCode}</p>
                    </div>
                    <button className="bg-white text-pink-600 p-2 rounded-lg hover:bg-pink-50 transition-colors">
                        <Copy size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                {[
                    { lvl: '1', comm: '40%' },
                    { lvl: '2', comm: '20%' },
                    { lvl: '3', comm: '10%' },
                ].map((tier) => (
                    <div key={tier.lvl} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                            L{tier.lvl}
                        </div>
                        <p className="text-2xl font-bold text-white">{tier.comm}</p>
                        <p className="text-xs text-slate-400">Commission</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UserBets = () => {
    const { bets, currentUser } = useContext(GameContext)!;
    const myBets = bets.filter(b => b.userId === currentUser!.id);

    return (
        <div className="space-y-4">
             <h2 className="text-xl font-bold text-white">My Bets</h2>
             {myBets.length === 0 ? (
                 <div className="text-center py-10 text-slate-500">No bets placed yet.</div>
             ) : (
                 myBets.map(bet => (
                     <div key={bet.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 relative overflow-hidden">
                         <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                             bet.status === 'WIN' ? 'bg-emerald-500' : bet.status === 'LOSS' ? 'bg-red-500' : 'bg-yellow-500'
                         }`}></div>
                         <div className="flex justify-between items-start mb-2 pl-3">
                             <div>
                                 <p className="text-sm text-slate-400">Period: {bet.periodId} ({bet.gameMode})</p>
                                 <p className="font-bold text-white mt-1">
                                     Selected: <span className="capitalize text-indigo-400">{bet.choice}</span>
                                 </p>
                             </div>
                             <div className="text-right">
                                 <p className={`font-bold ${bet.status === 'WIN' ? 'text-emerald-400' : bet.status === 'LOSS' ? 'text-red-400' : 'text-yellow-400'}`}>
                                     {bet.status}
                                 </p>
                                 {bet.status === 'WIN' && <p className="text-emerald-500 text-xs font-bold">+{formatCurrency(bet.winAmount)}</p>}
                             </div>
                         </div>
                         <div className="pl-3 flex justify-between items-center text-xs text-slate-500 border-t border-slate-700 pt-2 mt-2">
                             <span>ID: {bet.id}</span>
                             <span>Bet: {formatCurrency(bet.amount)}</span>
                         </div>
                     </div>
                 ))
             )}
        </div>
    );
};

const UserProfile = () => {
    const { currentUser, bets, transactions, userActions } = useContext(GameContext)!;
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit Form State
    const [editName, setEditName] = useState(currentUser?.name || '');
    const [editPassword, setEditPassword] = useState(currentUser?.password || '');
    const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');

    // Calculate Financial Stats
    const totalDeposits = transactions.filter(t => t.userId === currentUser!.id && t.type === 'DEPOSIT' && t.status === 'APPROVED').reduce((acc, t) => acc + t.amount, 0);
    const totalWithdrawals = transactions.filter(t => t.userId === currentUser!.id && t.type === 'WITHDRAWAL' && t.status === 'APPROVED').reduce((acc, t) => acc + t.amount, 0);
    
    const myBets = bets.filter(b => b.userId === currentUser!.id && b.status !== 'PENDING');
    const totalBetAmount = myBets.reduce((acc, b) => acc + b.amount, 0);
    const totalWinAmount = myBets.reduce((acc, b) => acc + b.winAmount, 0);
    const profitLoss = totalWinAmount - totalBetAmount;

    // Chart Calculations
    const maxVal = Math.max(totalDeposits, totalWithdrawals, 1);
    const depWidth = (totalDeposits / maxVal) * 100;
    const withWidth = (totalWithdrawals / maxVal) * 100;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setEditAvatar(ev.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        userActions.updateProfile(editName, editPassword, editAvatar);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-4 relative">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1">
                        {currentUser?.avatar ? (
                             <img src={currentUser.avatar} alt="Profile" className="w-full h-full rounded-full bg-slate-900 object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                                <User size={40} className="text-white" />
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{currentUser?.name}</h2>
                    <p className="text-slate-400 text-sm">UID: {currentUser?.uid}</p>
                    <p className="text-slate-500 text-xs">{maskMobile(currentUser?.mobile || '')}</p>
                </div>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="absolute right-0 top-0 bg-slate-800 p-2 rounded-full border border-slate-700 text-indigo-400 hover:text-white transition-colors"
                >
                    <Edit2 size={16} />
                </button>
            </div>

            {/* Financial Chart Dashboard */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                <h3 className="text-white font-bold mb-4 flex items-center">
                    <TrendingUp className="mr-2 text-indigo-400" size={20}/> Financial Overview
                </h3>
                
                {/* Visual Chart */}
                <div className="space-y-4 mb-6">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-emerald-400 font-bold uppercase">Total Deposit</span>
                            <span className="text-white">{formatCurrency(totalDeposits)}</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${depWidth}%`}}></div>
                        </div>
                    </div>
                    <div>
                         <div className="flex justify-between text-xs mb-1">
                            <span className="text-orange-400 font-bold uppercase">Total Withdrawal</span>
                            <span className="text-white">{formatCurrency(totalWithdrawals)}</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 transition-all duration-1000" style={{width: `${withWidth}%`}}></div>
                        </div>
                    </div>
                </div>

                {/* Profit/Loss Display */}
                <div className="bg-slate-900 rounded-lg p-4 text-center border border-slate-700">
                    <p className="text-slate-400 text-xs font-bold uppercase">Net Profit / Loss</p>
                    <p className={`text-2xl font-bold mt-1 ${profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <button className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center text-white hover:bg-slate-700 transition-colors">
                    <span className="flex items-center"><Settings size={18} className="mr-3 text-slate-400"/> Settings</span>
                    <ChevronRight size={18} className="text-slate-500" />
                </button>
                <button className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center text-white hover:bg-slate-700 transition-colors">
                    <span className="flex items-center"><AlertCircle size={18} className="mr-3 text-slate-400"/> About Us</span>
                    <ChevronRight size={18} className="text-slate-500" />
                </button>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-slate-800 w-full max-w-md rounded-2xl p-6 border border-slate-700 relative">
                        <button onClick={() => setIsEditing(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6">Edit Profile</h3>
                        
                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-indigo-500 mb-2 relative overflow-hidden group">
                                     {editAvatar ? (
                                        <img src={editAvatar} className="w-full h-full object-cover" />
                                     ) : (
                                         <User className="w-full h-full p-4 text-slate-600" />
                                     )}
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                         <Camera className="text-white" />
                                     </div>
                                     <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <p className="text-xs text-indigo-400">Tap image to change</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Full Name</label>
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
                                <input type="text" value={editPassword} onChange={e => setEditPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Email (Locked)</label>
                                    <input type="text" value={currentUser?.email} disabled className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-slate-500 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Mobile (Locked)</label>
                                    <input type="text" value={currentUser?.mobile} disabled className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-slate-500 cursor-not-allowed" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg mt-4 shadow-lg shadow-indigo-900/50">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};