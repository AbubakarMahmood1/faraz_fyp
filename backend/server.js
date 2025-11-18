const app = express();

app.listen(process.env.PORT, () => {
  console.log("server is running on port 3000");
});
export default app;
