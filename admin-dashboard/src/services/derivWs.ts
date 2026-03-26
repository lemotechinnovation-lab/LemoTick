let ws: WebSocket | null = null
let listeners: ((data: any) => void)[] = []
let isConnecting = false

export const connectDeriv = (appId: string, token?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            resolve()
            return
        }
        if (isConnecting) return

        isConnecting = true
        ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`)

        ws.onopen = () => {
            if (token) {
                ws!.send(JSON.stringify({ authorize: token }))
            } else {
                isConnecting = false
                resolve()
            }
        }

        ws.onmessage = (event) => {
            let data
            try {
                data = JSON.parse(event.data)
            } catch (e) {
                console.error('Invalid JSON from WS:', event.data)
                return
            }

            if (data.authorize) {
                isConnecting = false
                resolve()
            }

            if (data.error) {
                console.error('Deriv API Error:', data.error)
            }

            listeners.forEach((cb) => cb(data))
        }

        ws.onerror = (err) => {
            isConnecting = false
            reject(err)
        }

        ws.onclose = () => {
            ws = null
            listeners = []
            isConnecting = false
        }
    })
}

export const send = (payload: unknown) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify(payload))
}

export const addListener = (cb: (data: any) => void) => {
    listeners.push(cb)
}

export const removeListener = (cb: (data: any) => void) => {
    listeners = listeners.filter((l) => l !== cb)
}

export const disconnectDeriv = () => {
    ws?.close()
    ws = null
    listeners = []
}

// 🔥 helper to forget subscriptions
export const forget = (symbol: string) => {
    send({ forget: symbol })
}