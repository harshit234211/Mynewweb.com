const fs = require('fs');
const file = './src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const countdownCode = `
function parseMatchDate(dateStr, timeStr) {
  if (!dateStr || !timeStr) return new Date();
  const [day, month, year] = dateStr.split('/');
  const [time, ampm] = timeStr.split(' ');
  let [hours, mins] = time.split(':');
  hours = parseInt(hours);
  if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  
  const d = new Date();
  d.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
  d.setHours(hours, parseInt(mins), 0, 0);
  return d;
}

const CountdownTimer = ({ match }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      const matchTime = parseMatchDate(match.date, match.time);
      const now = new Date();
      const diff = matchTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('LIVE');
      } else {
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(d + ' Days : ' + h + ' Hours : ' + m + ' Minutes : ' + s + ' Seconds');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [match]);

  if (timeLeft === 'LIVE') {
    return <div className="mt-2 mb-2 text-center font-black text-red-500 animate-pulse uppercase tracking-widest text-lg border-2 border-red-500 rounded py-1">🔴 LIVE</div>;
  }
  
  return (
    <div className="mt-3 mb-2 bg-gray-50 border border-gray-100 rounded-lg p-2 text-center shadow-inner">
      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-wider">Starts In</p>
      <p className="text-sm font-black text-[#132040] tabular-nums tracking-wide">{timeLeft}</p>
    </div>
  );
};
`;

content = content.replace('function getTimeLeft(date: string, time: string) {', countdownCode + '\nfunction getTimeLeft(date: string, time: string) {');

const oldInfoBlock = `<div className="p-4 pt-8">
                  <p className="font-bold text-sm text-gray-900 mb-1 leading-snug">{match.title}</p>
                  <p className="text-gray-500 text-xs mb-4">Time : {match.date} at {match.time}</p>`;

const newInfoBlock = `<div className="p-4 pt-8">
                  <p className="font-bold text-sm text-gray-900 mb-1 leading-snug">{match.title}</p>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-500 text-xs font-semibold">Start: {match.date} at {match.time}</p>
                    <span className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase \${match.status === 'ongoing' ? 'bg-red-500 text-white animate-pulse' : match.status === 'completed' ? 'bg-green-500 text-white' : 'bg-[#132040] text-white'}\`}>{match.status === 'ongoing' ? 'LIVE' : match.status}</span>
                  </div>
                  {match.registrationClosingTime && match.status === 'upcoming' && (
                    <p className="text-red-500 text-[10px] font-bold mb-3 border border-red-100 bg-red-50 px-2 py-1 rounded inline-block">Reg Closes: {new Date(match.registrationClosingTime).toLocaleString()}</p>
                  )}`;

content = content.replace(oldInfoBlock, newInfoBlock);

const oldInfoBlock2 = `<div className="p-4">
                  <p className="font-bold text-sm text-gray-900 mb-1 leading-snug">{match.title}</p>
                  <p className="text-gray-400 text-xs mb-3">Time : {match.date} at {match.time}</p>`;

const newInfoBlock2 = `<div className="p-4">
                  <p className="font-bold text-sm text-gray-900 mb-1 leading-snug">{match.title}</p>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-500 text-xs font-semibold">Start: {match.date} at {match.time}</p>
                    <span className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase \${match.status === 'ongoing' ? 'bg-red-500 text-white animate-pulse' : match.status === 'completed' ? 'bg-green-500 text-white' : 'bg-[#132040] text-white'}\`}>{match.status === 'ongoing' ? 'LIVE' : match.status}</span>
                  </div>
                  {match.registrationClosingTime && match.status === 'upcoming' && (
                    <p className="text-red-500 text-[10px] font-bold mb-2 border border-red-100 bg-red-50 px-2 py-1 rounded inline-block">Reg Closes: {new Date(match.registrationClosingTime).toLocaleString()}</p>
                  )}`;

content = content.replace(oldInfoBlock2, newInfoBlock2);

// Inject into second card type (Contest List)
const oldSpotsBar = `<div className="flex justify-between text-[11px] mb-1 font-bold">
                        <span className="text-red-500">Only {spotsLeft} Spot{spotsLeft !== 1 ? 's' : ''} Left</span>
                        <span className="text-red-500">{match.joinedPlayers?.length || 0}/{match.totalSlots}</span>
                      </div>`;
const countdownInjection = `{match.status !== 'completed' && <CountdownTimer match={match} />}`;

content = content.replace(oldSpotsBar, countdownInjection + '\n                      ' + oldSpotsBar);

// Inject into first card type (Home My Matches)
const oldGridCard1 = `<div className="grid grid-cols-3 gap-3 mb-3">`;
content = content.replace(oldGridCard1, countdownInjection + '\n                  ' + oldGridCard1);


fs.writeFileSync(file, content, 'utf8');
