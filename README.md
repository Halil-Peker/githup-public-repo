# GitHub Repo Explorer

Next.js ile geliştirilmiş, GitHub kullanıcılarının public repolarını ve içeriklerini görüntülemeye yarayan bir web uygulaması. 

Proje çalışabilir olması için .env dosyası ekleyip token ekleyiniz. (Token buraya eklendiğinde geçersiz oluyor bu sebeple buraya eklenmedi.)

# GitHub API Token Ayarları
- GitHub Developer Settings sayfasına gidin
- "Generate new token" butonuna tıklayın
- Aşağıdaki scope'ları seçin:
public_repo
read:user
- Token oluşturduktan sonra kopyalayın ve .env.local dosyanıza ekleyin

## Canlı Demo
Aşağıda belirtilen linkten proje canlıya alındı fakat github'tan çekilen token vercel ile canlıya alınınca işlevselliğini kaybediyor. Bu sebeple proje canlıda ama token paylaşımı (.env dosyası) kapalı olduğu için işlevsel değil.
[GitHub Repo Explorer'ı Canlı Görüntüle](https://github-repo-explorer-demo.vercel.app)

## Kullanılan Teknolojiler

- Frontend Framework: Next.js 13
- UI Styling: Tailwind CSS
- API Client: GitHub REST API (https://github.com/settings/tokens)
- Markdown Render: react-markdown
- Data Fetching: getServerSideProps (Sunucu Taraflı Render)

## Özellikler
- Kullanıcı repo listesi görüntüleme
- Repo detay sayfası (README.md ve dosya yapısı)
- Dinamik dosya gezgini (File Explorer)
- Markdown render özelliği
- Responsive tasarım
- Breadcrumb navigasyon
- Özel ikon seti
- Sunucu taraflı veri çekme (SSR)

## Kullanılan GitHub API Endpoint'leri
- GET /users/{username}/repos - Kullanıcı repoları
- GET /repos/{owner}/{repo} - Repo detayları
- GET /repos/{owner}/{repo}/contents - Repo içeriği
- GET /repos/{owner}/{repo}/readme - README dosyası
