export const dynamic = "force-static"; // simple static page

export default function TwitterPlayer() {
  return (
    <html>
      <body style={{ margin: 0, background: "black" }}>
        <video
          src="/dig-id-open-graph.mp4"
          width={800}
          height={450}
          controls
          playsInline
          muted
          preload="metadata"
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      </body>
    </html>
  );
}