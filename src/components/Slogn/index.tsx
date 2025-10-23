// import Lottie from 'react-lottie';
// import { animationData } from './animation';
import styles from './index.module.css';

const Slogn: GenieType.FC = () => {
  // const defaultOptions = {
  //   loop: true,
  //   autoplay: true,
  //   animationData: animationData,
  //   rendererSettings: {
  //     preserveAspectRatio: 'xMidYMid slice',
  //     className: 'lottie'
  //   },
  // };
  return (
    <div className='mb-54'>
      {/* <Lottie options={defaultOptions}
        height={68}
        width={200}
      /> */}
      <div className={`text-[40px] text-center font-[550] ${styles.logo}`}>
        <span>华</span>
        <span>夏</span>
        <span>研</span>
        <span>究</span>
      </div>
    </div>

  );
};

export default Slogn;
