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
    { name: 'Features Page', command: 'npm run create-features' },
    { name: 'Pricing Page', command: 'npm run create-pricing' },
    { name: 'Get Started Page', command: 'npm run create-get-started' },
    { name: 'Resources Page', command: 'npm run create-resources' },
    { name: 'Contact Page', command: 'npm run create-contact' },
    { name: 'Privacy Policy and Terms of Service', command: 'npm run create-pages' },
    { name: 'Demo Landing Pages', command: 'npm run create-landing' },
    { name: 'Articles', command: 'npm run create-articles' },
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
  console.log('✅ All Contentful content types (including Recent Articles)')
  console.log('✅ Main and footer navigation menus')
  console.log('✅ Homepage with comprehensive sections')
  console.log('✅ Features page with detailed functionality')
  console.log('✅ Pricing page with subscription tiers')
  console.log('✅ Get Started page for onboarding')
  console.log('✅ Resources page with Recent Articles section')
  console.log('✅ Contact page with map embed')
  console.log('✅ Articles')
  console.log('✅ Privacy Policy and Terms of Service pages')
  console.log('✅ Demo landing pages')
  console.log('\n🌐 Your complete SyncNext site is ready!')
  console.log('Visit: http://localhost:8080/')
  console.log('\n🔧 Available commands:')
  console.log('npm run dev          # Start development server')
  console.log('npm run build        # Build for production')
  console.log('npm run storybook    # View component library')
}

createAllContent()
