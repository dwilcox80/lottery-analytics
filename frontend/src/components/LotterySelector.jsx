export default function LotterySelector({ value, onChange }) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="powerball">Powerball</option>
            <option value="megamillions">Mega Millions</option>
        </select>
    );
}