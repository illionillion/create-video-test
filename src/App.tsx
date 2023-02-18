import { Button, Center, Input } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import "./App.css";

const width = 250;
const height = 250;
const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [movieLengthSec, setMovieLengthSec] = useState<number>(5);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const getContext = (): CanvasRenderingContext2D => {
    const canvas: any = canvasRef.current;

    return canvas.getContext("2d");
  };

  useEffect(() => {
    const ctx: CanvasRenderingContext2D = getContext();
    let x = 0;
    let y = 0;
    setInterval(() => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#000";
      ctx.fillRect(x, y, 100, 25);
      ctx.save();
      if (x + 100 >= width) {
        y += 25;
        x = 0;
      }
      if (y + 25 >= 255) {
        y = 0;
      }
      x += 5;
    }, 40);
  }, []);
  function frame_start() {
    if (!canvasRef.current) return;
    //canvasの取得
    const canvas = canvasRef.current;
    //canvasからストリームを取得
    const stream = canvas.captureStream();
    //ストリームからMediaRecorderを生成
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });
    //ダウンロード用のリンクを準備
    //録画終了時に動画ファイルのダウンロードリンクを生成する処理
    recorder.ondataavailable = function (e) {
      const videoBlob = new Blob([e.data], { type: e.data.type });
      const blob_Url = window.URL.createObjectURL(videoBlob);
      setBlobUrl(blob_Url);
    };
    //録画開始
    recorder.start();
    setIsProcessing(true);

    setTimeout(() => {
      console.log("stopping");
      recorder.stop();
      setIsProcessing(false);
    }, movieLengthSec * 1000);
  }
  return (
    <Center w="100vw" h="100vh" className="App" flexDirection="column">
      <canvas
        width={width}
        height={height}
        ref={canvasRef}
        style={{ borderBlock: "solid", borderWidth: 1, borderColor: "#000" }}
      />
      <Center w="2xs">
        <Input
          type="number"
          value={movieLengthSec}
          min={1}
          onChange={(e) =>
            setMovieLengthSec(
              isNaN(parseInt(e.currentTarget.value))
                ? 1
                : parseInt(e.currentTarget.value)
            )
          }
          isDisabled={isProcessing}
        />
        秒
      </Center>
      <Button onClick={frame_start} isDisabled={isProcessing}>
        {isProcessing ? "録画中" : "録画開始"}
      </Button>
      {blobUrl !== "" ? (
        <video
          src={blobUrl}
          controls
          style={{ borderBlock: "solid", borderWidth: 1, borderColor: "#000" }}
        ></video>
      ) : (
        <></>
      )}
    </Center>
  );
};

export default App;
