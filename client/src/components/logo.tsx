import alphaLogo from '@assets/Alpha_Logo_Regulatorio_Positivo - Copy_1754531999577.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto'
  };

  return (
    <img 
      src={alphaLogo} 
      alt="Alpha Logo" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}