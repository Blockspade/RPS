export interface SaltData {
  salt: string;
}

export function downloadSaltFile(salt: string): void {
  try {
    const data: SaltData = {
      salt
    };
    
    const fileContent = JSON.stringify(data, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.download = `rps_salt.json`;
    link.href = url;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

export function uploadSaltFile(): Promise<SaltData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      if (!file.name.endsWith('.json')) {
        reject(new Error('Please select a JSON file'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const content = event.target?.result as string;
          const data: SaltData = JSON.parse(content);
          
          if (!data.salt) {
            reject(new Error('Invalid file: missing salt'));
            return;
          }
          
          resolve(data);
        } catch (error) {
          reject(new Error('Failed to parse JSON file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  });
}
