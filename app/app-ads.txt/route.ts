export async function GET() {
  const content = `google.com, pub-5450514125268915, DIRECT, f08c47fec0942fa0`;
  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
