import profileImg from './assets/profile.webp';
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import PostsTable from './demo/PostsTable.jsx';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { ErrorBoundary, getErrorMessage} from 'react-error-boundary';

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <section id="header">
<Stack
            direction="row"
            alignItems="center"
            sx={{
              justifyContent: "space-between"
            }}
          >
            <Typography variant="h6" component="div">
              React Data Table
            </Typography>
            <Avatar
              alt="An image of Temesgen Adane. The creator of this website."
              src={profileImg}
              sx={{
                width: 32,
                height: 32,
                ml: 'auto',
                '& .MuiAvatar-img': { objectPosition: 'top' },
              }}
            >
              T
            </Avatar>
          </Stack>
        </section>

        <div className="ticks"></div>

        {/*
        <section id="center">
          <div className="hero">
            <img src={heroImg} className="base" width="170" height="179" alt="" />
            <img src={reactLogo} className="framework" alt="React logo" />
            <img src={viteLogo} className="vite" alt="Vite logo" />
          </div>
        </section>

        <div className="ticks"></div>
        */}

        <section id="table">
          <ErrorBoundary
            fallbackRender={({ error }) => (
              <div role="alert">
                <p>Something went wrong:</p>
                <pre>{getErrorMessage(error)}</pre>
              </div>
            )}
            // onError={(error, info) => {
              // Log the error to your error reporting service
            // }}
          >
            <PostsTable />
          </ErrorBoundary>
        </section>

        <div className="ticks"></div>

        <section id="next-steps">
          <div id="docs">
            <svg className="icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#documentation-icon"></use>
            </svg>
            <h2>Github</h2>
            <p>Find the full code.</p>
            <ul>
              <li>
                <a href="https://github.com/vitejs/vite" target="_blank">
                  <svg
                    className="button-icon"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <use href="/icons.svg#github-icon"></use>
                  </svg>
                  Github repo
                </a>
              </li>
            </ul>
          </div>
          <div id="social">
            <svg className="icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#social-icon"></use>
            </svg>
            <h2>Temesgen Adane</h2>
            <p>Profile Links</p>
            <ul>
              <li>
                <a href="https://github.com/vitejs/vite" target="_blank">
                  <svg
                    className="button-icon"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <use href="/icons.svg#github-icon"></use>
                  </svg>
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://chat.vite.dev/" target="_blank">
                  <svg
                    className="button-icon"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <use href="/icons.svg#discord-icon"></use>
                  </svg>
                  Discord
                </a>
              </li>
              <li>
                <a href="https://x.com/vite_js" target="_blank">
                  <svg
                    className="button-icon"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <use href="/icons.svg#x-icon"></use>
                  </svg>
                  X.com
                </a>
              </li>
              <li>
                <a href="https://bsky.app/profile/vite.dev" target="_blank">
                  <svg
                    className="button-icon"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <use href="/icons.svg#bluesky-icon"></use>
                  </svg>
                  Bluesky
                </a>
              </li>
            </ul>
          </div>
        </section>

        <div className="ticks"></div>
        <section id="spacer"></section>
      </ThemeProvider>
    </>
  )
}

export default App
