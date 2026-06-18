# Builds a standalone index.html by inlining IshanaShop.jsx into the template.
# Run this after editing IshanaShop.jsx:  powershell -File build.ps1
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$src  = [System.IO.File]::ReadAllText((Join-Path $dir "IshanaShop.jsx"))
$tmpl = [System.IO.File]::ReadAllText((Join-Path $dir "index.template.html"))
$html = $tmpl.Replace("/*__GAME_SOURCE__*/", $src)
$utf8 = New-Object System.Text.UTF8Encoding($false)   # no BOM
[System.IO.File]::WriteAllText((Join-Path $dir "index.html"), $html, $utf8)
Write-Host ("Built index.html  ({0} bytes)" -f $html.Length)
