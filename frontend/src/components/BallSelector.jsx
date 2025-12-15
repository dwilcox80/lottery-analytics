export default function BallSelector( { max, value, onChange}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
        >
            {Array.from({ length: max }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                    Ball {i + 1}
                </option>
            ))}
        </select>
    );
}