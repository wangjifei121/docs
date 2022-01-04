### 查看文件编码
- 在Vim中可以直接查看文件编码
`:set fileencoding`即可显示文件编码格式。
- 如果你只是想查看其它编码格式的文件或者想解决用Vim查看文件乱码的问题，那么你可以在
~/.vimrc 文件中添加以下内容：
`set encoding=utf-8 fileencodings=ucs-bom,utf-8,cp936`
这样，就可以让vim自动识别文件编码（可以自动识别UTF-8或者GBK编码的文件），其实就是依照fileencodings提供的编码列表尝试，如果没有找到合适的编码，就用latin-1(ASCII)编码打开。
