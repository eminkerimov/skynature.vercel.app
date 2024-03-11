import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import NewsPage from "./pages/NewsPage/NewsPage";
import ScrollToTop from "./helpers/ScrollToTop";

const Layout = () => {
  return (
    <div className="app">
      <ScrollToTop />
      <Header/>
      <Outlet/>
      <Footer/>
    </div>
  )
}

const router =createBrowserRouter([
  {
    path:"/",
    element:<Layout/>,
    children:[
      {
        path:"/",
        element:<Home/>
      },
      {
        path:"/news/:id",
        element:<NewsPage/>
      }
    ]
  }
])


function App() {
  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  );
}

export default App;
