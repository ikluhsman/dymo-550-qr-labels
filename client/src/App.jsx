import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function App() {
  const [prefix, setPrefix] = useState('T')
  const [count, setCount] = useState(1)
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(false)

  async function allocate() {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/allocate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, count: Number(count) })
      })

      const data = await res.json()
      setCodes(data.codes || [])
    } catch (err) {
      console.error(err)
      alert('Allocation failed')
    }
    setLoading(false)
  }

  function printLabels() {
    window.print()
  }

  return (
    <div>
      <div className="controls">
        <h2>Dymo 550 QR Generator</h2>

        <div className="print-instructions">
          <h3>Print Settings</h3>
          <ul>
            <li>Printer: Dymo LabelWriter 550</li>
            <li>Paper Size: 1\" x 1\" roll</li>
            <li>Scale: 100% (Actual Size)</li>
            <li>Margins: None</li>
            <li>Disable Fit to Page</li>
          </ul>
        </div>

        <label>
          Prefix:
          <input
            value={prefix}
            maxLength={1}
            onChange={(e) => setPrefix(e.target.value.toUpperCase())}
          />
        </label>

        <label>
          Count:
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </label>

        <button onClick={allocate} disabled={loading}>
          {loading ? 'Allocating…' : 'Allocate'}
        </button>

        <button onClick={printLabels} disabled={!codes.length}>
          Print
        </button>
      </div>

      <div className="label-container">
        {codes.map((code) => (
          <Label key={code} code={code} />
        ))}
      </div>
    </div>
  )
}

function Label({ code }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    QRCode.toDataURL(code, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 300
    }).then(setSrc)
  }, [code])

  return (
    <div className="dymo-label">
      {src && <img src={src} alt={code} />}
      <div className="code-text">{code}</div>
    </div>
  )
}
