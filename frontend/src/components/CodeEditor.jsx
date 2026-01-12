export default function CodeEditor({ code, setCode }) {
  return (
    <textarea
      className="w-full h-40 text-black p-2"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      placeholder="print('Hello World')"
    />
  );
}