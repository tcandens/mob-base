import {} from 'react-hook-form'
import {  Form, FormControl, FormItem, FormField, FormMessage, FormDescription } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Auth() {
  return (
    <form>
      <Input type="text" name="" />
      <Button>
        Login
      </Button>
    </form>
  )
}
