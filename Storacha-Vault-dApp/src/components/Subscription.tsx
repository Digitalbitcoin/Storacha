import { PaperPlaneIcon, CheckIcon} from '@radix-ui/react-icons';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

const Subscription = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const email = emailRef.current?.value?.trim();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('entry.893099679', email);

      await fetch('https://docs.google.com/forms/d/e/1FAIpQLSfVuvxPqTHYlYrNI3ybJWLgLHS631oYVlD09QnDnugbZ06Iaw/formResponse', {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });

      setIsSubmitted(true);
      toast.success('Thank you!');
      
      if (emailRef.current) {
        emailRef.current.value = '';
      }
      
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
      
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
      <input 
        type="email" 
        ref={emailRef}
        placeholder="Your email" 
        style={{
          padding: '10px 14px',
          border: '1px solid var(--ruby-6)',
          borderRight: 'none',
          borderRadius: '5px 0 0 5px',
          backgroundColor: 'var(--color-panel-solid)',
          color: 'var(--gray-12)',
          fontSize: '14px',
          flex: 1,
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
        required
        disabled={isSubmitting || isSubmitted}
      />
      <button 
        type="submit"
        disabled={isSubmitting || isSubmitted}
        style={{
          padding: '10px 16px',
          background: isSubmitted 
            ? '#07d300'
            : '#e91315',
          color: 'white',
          border: 'none',
          borderRadius: '0 8px 8px 0',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease'
        }}
      >
        {isSubmitting ? (
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}/>
        ) : isSubmitted ? (
          <>
            <CheckIcon width={16} height={16} />
            <span>Done</span>
          </>
        ) : (
          <>
            <PaperPlaneIcon width={16} height={16} />
            <span>Send</span>
          </>
        )}
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
};

export default Subscription;