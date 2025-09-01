export const runtime = "edge"; 
export const dynamic = "force-static";

export default function TwitterPlayerPage() {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Digital ID Video</title>
      </head>
      <body style={{ margin: 0, background: "#000", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <video
          src="/dig-id-open-graph.mp4"
          width="800"
          height="450"
          controls
          autoPlay
          playsInline
          muted
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </body>
    </html>
  );
}