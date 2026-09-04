import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import PostsTable from './demo/PostsTable.jsx';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import { ErrorBoundary, getErrorMessage } from 'react-error-boundary';
import profileImg from './assets/profile.webp';

const socialLinks = [
  { label: 'Website', icon: LanguageIcon, href: 'https://temesgen.vercel.app/' },
  { label: 'GitHub', icon: GitHubIcon, href: 'https://github.com/temesgen-982' },
  { label: 'LinkedIn', icon: LinkedInIcon, href: 'https://www.linkedin.com/in/temesgen-adane/' },
];

function LinkList({ items }) {
  return (
    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: '32px 0 0', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {items.map((item) => (
        <li key={item.label}>
          <ButtonBase
            component="a"
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'text.secondary',
              fontSize: 16,
              borderRadius: '6px',
              bgcolor: 'var(--social-bg)',
              px: 1.5,
              py: '6px',
              gap: 1,
              alignItems: 'center',
              '&:hover': { boxShadow: 'var(--shadow)' },
            }}
          >
            <item.icon sx={{ fontSize: 18 }} />
            {item.label}
          </ButtonBase>
        </li>
      ))}
    </Box>
  );
}

function Section({ id, children }) {
  return (
    <Box component="section" id={id} sx={{ p: '3rem', borderTop: 1, borderColor: 'divider' }}>
      {children}
    </Box>
  );
}

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box component="header" id="header" sx={{ py: 2, px: '2.5rem', borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              React Data Table
            </Typography>
            <Avatar
              alt="An image of Temesgen Adane. The creator of this website."
              src={profileImg}
              sx={{ width: 32, height: 32, ml: 'auto', '& .MuiAvatar-img': { objectPosition: 'top' } }}
            >
              T
            </Avatar>
          </Stack>
        </Box>

        <div className="ticks"></div>

        <Section id="table">
          <ErrorBoundary
            fallbackRender={({ error }) => (
              <div role="alert">
                <p>Something went wrong:</p>
                <pre>{getErrorMessage(error)}</pre>
              </div>
            )}
          >
            <PostsTable />
          </ErrorBoundary>
        </Section>

        <div className="ticks"></div>

        <Box 
          id="whats-this"
          sx={{borderTop: 1, borderColor: 'divider'}}
        >
          <Accordion elevation={0} borderRadius={0} sx={{py: 0}}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="what's this"
sx={{
                minHeight: 'auto',
                alignItems: 'center',
                '&.Mui-expanded': { minHeight: 'auto' },
                '& .MuiAccordionSummary-content': { my: 0 },
                borderBottom: 1,
                borderColor: 'divider',
                py: 2,
                px: 4
              }}
              >
                <Typography component="span" sx={{ fontSize: 24, lineHeight: '118%', letterSpacing: '-0.24px', color: 'text.secondary' }}>
                What's this?
              </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  py: 2,
                  px: 4
                }}
              >
                <Typography sx={{ maxWidth: '80ch', textAlign: 'justify', mb: 1 }}>
                  This page is a live demo of a data table built on{' '}
                  <a href="https://mui.com" target="_blank" rel="noopener noreferrer">MUI</a>.
                </Typography>
                <Typography sx={{ maxWidth: '80ch', textAlign: 'justify', mb: 1 }}>
                  It loads posts from a live API and demonstrates sorting,
                  pagination, column visibility toggles, row selection, CSV export, a
                  dense-mode toggle, and a card layout that kicks in on smaller screens.
                  You can try clicking a user badge or a tag chip to filter the data
                  server-side.
                </Typography>
                <Typography sx={{ maxWidth: '80ch', textAlign: 'justify', mb: 1 }}>
                  If you're building a CRUD-heavy app with lots of tables on MUI, this is
                  a solid starting point. Clone the{' '}
                  <a href="https://github.com/temesgen-982/MUI-react-data-table" target="_blank" rel="noopener noreferrer">
                    repo
                  </a>{' '}
                  inside your project and let your AI agent handle the rest.
                </Typography>
              </AccordionDetails>
          </Accordion>
        </Box>

        <div className="ticks"></div>

        <Box
          component="section"
          id="next-steps"
          sx={{ display: 'flex', borderTop: 1, borderColor: 'divider' }}
        >
          <Box component="div" sx={{ flex: '1 1 0', p: 4, borderRight: 1, borderColor: 'divider' }}>
            <Box sx={{ mb: 2 }}>
              <ArticleIcon sx={{ fontSize: 22 }} />
            </Box>
            <h2>Github</h2>
            <p>Find the full code.</p>
            <LinkList items={[{ label: 'Github repo', icon: GitHubIcon, href: 'https://github.com/temesgen-982/MUI-react-data-table' }]} />
          </Box>
          <Box component="div" sx={{ flex: '1 1 0', p: 4 }}>
            <Box sx={{ mb: 2 }}>
              <PersonIcon sx={{ fontSize: 22 }} />
            </Box>
            <h2>Temesgen Adane</h2>
            <p>Profile Links</p>
            <LinkList items={socialLinks} />
          </Box>
        </Box>

        <div className="ticks"></div>
        <Box component="section" id="spacer" sx={{ height: '8rem', borderTop: 1, borderColor: 'divider' }} />
      </ThemeProvider>
    </>
  );
}

export default App;
