import asyncio
import websockets
import json

clients = set()
users = {}  # websocket -> username


async def broadcast(message):
    if clients:
        await asyncio.gather(*[client.send(json.dumps(message)) for client in clients])


async def handler(websocket):
    clients.add(websocket)
    username = None

    try:
        async for message in websocket:
            data = json.loads(message)

            # 🔹 Пользователь подключился
            if data["type"] == "join":
                username = data["username"]
                users[websocket] = username

                await broadcast({
                    "type": "status",
                    "text": f"{username} подключился"
                })

                await broadcast({
                    "type": "users",
                    "users": list(users.values())
                })

            # 🔹 Сообщение
            elif data["type"] == "message":
                await broadcast({
                    "type": "message",
                    "username": users.get(websocket, "Unknown"),
                    "text": data["text"]
                })

    except:
        pass

    finally:
        clients.remove(websocket)

        if websocket in users:
            left_user = users[websocket]
            del users[websocket]

            await broadcast({
                "type": "status",
                "text": f"{left_user} вышел"
            })

            await broadcast({
                "type": "users",
                "users": list(users.values())
            })


async def main():
    async with websockets.serve(handler, "127.0.0.1", 8765):
        print("🚀 Server started at ws://127.0.0.1:8765")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())

# pip install websockets
# Запуск сервера: python .\serve\main.py &
# Запуск клиента: cd client/ && python -m http.server 8000 &