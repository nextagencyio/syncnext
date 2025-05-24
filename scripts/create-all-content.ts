import { execSync } from 'child_process'
import * as dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config({ path: '.env' })

async function createAllContent() {
  console.log('🚀 Setting up complete SyncNext demo content...\n')

  const scripts = [
    { name: 'Content Types', command: 'npm run setup-contentful' },
    { name: 'Navigation Menus', command: 'npm run create-menus' },
    { name: 'Homepage', command: 'npm run create-homepage' },
    { name: 'Get Started Page', command: 'npm run create-get-started' },
    { name: 'Contact Page', command: 'npm run create-contact' },
    { name: 'Sample Pages', command: 'npm run create-pages' },
    { name: 'Demo Landing Pages', command: 'npm run create-landing' },
  ]

  for (const script of scripts) {
    try {
      console.log(`📝 Creating ${script.name}...`)
      execSync(script.command, { stdio: 'inherit' })
      console.log(`✅ ${script.name} created successfully!\n`)
    } catch (error) {
      console.error(`❌ Error creating ${script.name}:`, error)
      process.exit(1)
    }
  }

  console.log('🎉 SyncNext demo content setup completed successfully!')
  console.log('\n📋 What was created:')
  console.log('✅ All Contentful content types')
  console.log('✅ Main and footer navigation menus')
  console.log('✅ Homepage with comprehensive sections')
  console.log('✅ Get Started page for onboarding')
  console.log('✅ Contact page with map embed')
  console.log('✅ Sample pages and articles')
  console.log('✅ Demo landing pages')
  console.log('\n🌐 Your SyncNext site is ready!')
  console.log('Visit: http://localhost:8080/')
  console.log('\n🔧 Available commands:')
  console.log('npm run dev          # Start development server')
  console.log('npm run build        # Build for production')
  console.log('npm run storybook    # View component library')
}

createAllContent()
