const fs = require('fs');
const file = '/Users/Vlad/Documents/WeGaS/wegas-finance/desktop/frontend/src/components/accounts/form/AccountForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the Form start
const formStartIndex = content.indexOf('<S.Form ref={formRef}');

// Find the RightColumn block
const rightColRegex = /\{\/\* --- RIGHT COLUMN: PREVIEW --- \*\/\}\s*<S\.RightColumn>([\s\S]*?)<\/S\.RightColumn>/;
const match = content.match(rightColRegex);

if (match && formStartIndex !== -1) {
    let rightColContent = match[0];
    // Remove the block from the original content
    content = content.replace(rightColContent, '');
    
    // Rename RightColumn to LeftColumn
    rightColContent = rightColContent.replace(/<S\.RightColumn>/g, '<S.LeftColumn>').replace(/<\/S\.RightColumn>/g, '</S.LeftColumn>');
    rightColContent = rightColContent.replace('RIGHT COLUMN', 'LEFT COLUMN');

    // Insert before <S.Form
    const finalContent = content.substring(0, formStartIndex) + rightColContent + '\n\n      ' + content.substring(formStartIndex);
    
    fs.writeFileSync(file, finalContent);
    console.log('Successfully reordered AccountForm.tsx');
} else {
    console.log('Could not find necessary blocks');
}
