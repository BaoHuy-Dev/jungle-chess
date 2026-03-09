import { useUIStore } from './store/gameStore';
import { GameScene } from './components/game3d/GameScene';
import { GameHUD } from './components/ui/GameHUD';
import { MainMenu } from './components/ui/MainMenu';
import './App.css';

function App() {
  const { currentPage } = useUIStore();

  return (
    <div className="app">
      {currentPage === 'menu' && <MainMenu />}
      {currentPage === 'game' && (
        <>
          <GameScene />
          <GameHUD />
        </>
      )}
    </div>
  );
}

export default App;
